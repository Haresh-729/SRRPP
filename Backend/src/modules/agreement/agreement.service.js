const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { deleteFile, getFileUrl } = require('../../utils/fileHelper');
const { buildRentCycles } = require('../../utils/rentCalculator');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');

// ── Internal: generate rent ledger rows ───────────────────────────────────────

const generateRentLedgers = (
  agreementId, propertyId, tenantId, cycles, durationMonths,
  rentDueDay, startDate, gstApplicable, gstPercent, gstBillingType, gstAlternateStartsOn, gstInclusive
) => {
  const ledgers = [];

  for (let i = 0; i < durationMonths; i++) {
    const ledgerDate = new Date(startDate);
    ledgerDate.setMonth(ledgerDate.getMonth() + i);

    const year  = ledgerDate.getFullYear();
    const month = ledgerDate.getMonth() + 1;
    const ledgerMonth = `${year}-${String(month).padStart(2, '0')}`;

    const cycleIndex = Math.min(Math.floor(i / 11), cycles.length - 1);
    const cycle = cycles[cycleIndex];

    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const dueDay  = Math.min(rentDueDay, lastDayOfMonth);
    const dueDate = new Date(year, month - 1, dueDay);

    // GST logic — monthNumber is 1-based position in agreement
    const monthNumber = i + 1;
    let gstApplicableThisMonth = false;
    let gstAmount = 0;
    let rentAmount = parseFloat(cycle.monthly_rent);

    if (gstApplicable && gstPercent) {
      if (gstBillingType === 'EVERY_MONTH') {
        gstApplicableThisMonth = true;
      } else if (gstBillingType === 'ALTERNATE_MONTH') {
        // gstAlternateStartsOn: 1 = odd months (1,3,5...), 2 = even months (2,4,6...)
        const startsOn = parseInt(gstAlternateStartsOn) || 1;
        gstApplicableThisMonth = (monthNumber % 2) === (startsOn % 2);
      }

      if (gstApplicableThisMonth) {
        const grossRent = parseFloat(cycle.monthly_rent);
        const percent = parseFloat(gstPercent);

        if (gstInclusive) {
          const baseRent = parseFloat((grossRent / (1 + (percent / 100))).toFixed(2));
          const gstPart = parseFloat((grossRent - baseRent).toFixed(2));
          rentAmount = baseRent;
          gstAmount = gstPart;
        } else {
          gstAmount = parseFloat(((grossRent * percent) / 100).toFixed(2));
          rentAmount = grossRent;
        }
      }
    }

    const totalDue = gstApplicableThisMonth && gstInclusive
      ? parseFloat(cycle.monthly_rent)
      : parseFloat((rentAmount + gstAmount).toFixed(2));

    ledgers.push({
      agreement_id:             agreementId,
      property_id:              propertyId,
      tenant_id:                tenantId,
      rent_cycle_id:            cycle.id,
      ledger_month:             ledgerMonth,
      rent_amount:              rentAmount,
      gst_amount:               gstAmount,
      gst_applicable_this_month: gstApplicableThisMonth,
      balance_from_previous:    0,
      total_due:                totalDue,
      paid_amount:              0,
      balance_carried:          0,
      due_date:                 dueDate,
      status:                   'PENDING',
    });
  }

  return ledgers;
};

// ── Internal: calculate brokerage amount ──────────────────────────────────────

const calculateBrokerageAmount = (type, value, monthlyRent) => {
  if (type === 'PERCENTAGE') {
    return parseFloat(((parseFloat(monthlyRent) * parseFloat(value)) / 100).toFixed(2));
  }
  return parseFloat(value);
};

// ── Internal: full agreement fetch ───────────────────────────────────────────

const fetchFullAgreement = async (id) => {
  return prisma.agreements.findUnique({
    where: { id },
    include: {
      properties: {
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
          property_types: { select: { id: true, name: true } },
        },
      },
      tenants: {
        select: {
          id: true,
          full_name: true,
          email: true,
          whats_app_no: true,
          dob: true,
          permanent_address: true,
        },
      },
      brokers: {
        select: { id: true, name: true, contact_no: true, email: true },
      },
      deposit_payments: true,
      brokerage_payments: true,
      agreement_rent_cycles: {
        orderBy: { cycle_number: 'asc' },
      },
      rent_ledgers: {
        orderBy: [{ ledger_month: 'asc' }],
      },
      _count: {
        select: { payments: true, rent_ledgers: true },
      },
    },
  });
};

// ── Create Agreement ──────────────────────────────────────────────────────────

const createAgreement = async (data, files) => {
  const durationMonths = parseInt(data.durationMonths);
  const monthlyRent = parseFloat(data.monthlyRent);
  const rentDueDay = parseInt(data.rentDueDay);
  const depositAmount = parseFloat(data.depositAmount);
  const rentEscalationPercent = data.rentEscalationPercent
    ? parseFloat(data.rentEscalationPercent)
    : null;
  const gstApplicable        = data.gstApplicable === 'true' || data.gstApplicable === true;
  const gstPercent           = gstApplicable && data.gstPercent ? parseFloat(data.gstPercent) : null;
  const gstBillingType       = gstApplicable && data.gstBillingType ? data.gstBillingType : null;
  const gstAlternateStartsOn = gstBillingType === 'ALTERNATE_MONTH' && data.gstAlternateStartsOn
    ? parseInt(data.gstAlternateStartsOn)
    : null;
  const gstInclusive         = gstApplicable && (data.gstInclusive === 'true' || data.gstInclusive === true);

  // ── Validations ────────────────────────────────────────────────────────────

  const property = await prisma.properties.findUnique({
    where: { id: data.propertyId },
  });

  if (!property || !property.is_active) {
    if (files?.agreementPdf?.[0]) deleteFile(files.agreementPdf[0].path);
    throw new AppError('Property not found or inactive.', 404);
  }

  if (property.status !== 'VACANT') {
    if (files?.agreementPdf?.[0]) deleteFile(files.agreementPdf[0].path);
    throw new AppError('Property is already rented. Cannot create a new agreement.', 400);
  }

  const tenant = await prisma.tenants.findUnique({
    where: { id: data.tenantId },
  });

  if (!tenant || !tenant.is_active) {
    if (files?.agreementPdf?.[0]) deleteFile(files.agreementPdf[0].path);
    throw new AppError('Tenant not found or inactive.', 404);
  }

  if (data.brokerId) {
    const broker = await prisma.brokers.findUnique({
      where: { id: data.brokerId },
    });
    if (!broker || !broker.is_active) {
      if (files?.agreementPdf?.[0]) deleteFile(files.agreementPdf[0].path);
      throw new AppError('Broker not found or inactive.', 404);
    }
  }

  // Validate broker + brokerage fields together
  if (data.brokerId && (!data.brokerageType || !data.brokerageValue)) {
    if (files?.agreementPdf?.[0]) deleteFile(files.agreementPdf[0].path);
    throw new AppError('Brokerage type and value are required when a broker is provided.', 400);
  }

  // ── Date calculations ──────────────────────────────────────────────────────

  const startDate = new Date(data.startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  endDate.setDate(endDate.getDate() - 1);

  // ── Rent cycles ────────────────────────────────────────────────────────────

  const cycleData = buildRentCycles(startDate, durationMonths, monthlyRent, rentEscalationPercent);

  // ── Transaction ────────────────────────────────────────────────────────────

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create agreement
    const agreement = await tx.agreements.create({
      data: {
        property_id: data.propertyId,
        tenant_id: data.tenantId,
        broker_id: data.brokerId || null,
        agreement_pdf: files?.agreementPdf?.[0]
          ? getFileUrl(files.agreementPdf[0].path)
          : null,
        duration_months: durationMonths,
        start_date: startDate,
        end_date: endDate,
        monthly_rent: monthlyRent,
        rent_escalation_percent: rentEscalationPercent,
        rent_due_day: rentDueDay,
        deposit_amount: depositAmount,
        status: 'ACTIVE',
        gst_applicable:         gstApplicable,
        gst_percent:            gstPercent,
        gst_billing_type:       gstBillingType,
        gst_alternate_starts_on: gstAlternateStartsOn,
        gst_is_inclusive:       gstInclusive,
      },
    });

    // 2. Create rent cycles
    const createdCycles = [];
    for (const cycle of cycleData) {
      const created = await tx.agreement_rent_cycles.create({
        data: {
          agreement_id: agreement.id,
          cycle_number: cycle.cycleNumber,
          start_date: cycle.startDate,
          end_date: cycle.endDate,
          monthly_rent: cycle.monthlyRent,
        },
      });
      createdCycles.push(created);
    }

    // 3. Generate rent ledgers
    const ledgers = generateRentLedgers(
      agreement.id,
      agreement.property_id,
      agreement.tenant_id,
      createdCycles,
      durationMonths,
      rentDueDay,
      startDate,
      gstApplicable,
      gstPercent,
      gstBillingType,
      gstAlternateStartsOn,
      gstInclusive
    );

    await tx.rent_ledgers.createMany({ data: ledgers });

    // 4. Deposit payment at creation (optional)
    if (data.depositReceivedOn && data.depositPaymentMode) {
      await tx.deposit_payments.create({
        data: {
          agreement_id: agreement.id,
          amount: depositAmount,
          received_on: new Date(data.depositReceivedOn),
          payment_mode: data.depositPaymentMode,
          cheque_number: data.depositChequeNumber || null,
          cheque_date: data.depositChequeDate ? new Date(data.depositChequeDate) : null,
          bank_name: data.depositBankName || null,
          cheque_photo: files?.depositChequePhoto?.[0]
            ? getFileUrl(files.depositChequePhoto[0].path)
            : null,
          remarks: data.depositRemarks || null,
        },
      });
    }

    // 5. Brokerage payment (optional — only when broker provided)
    if (data.brokerId && data.brokerageType && data.brokerageValue) {
      const brokerageAmount = calculateBrokerageAmount(
        data.brokerageType,
        data.brokerageValue,
        monthlyRent
      );
      const brokerageIsPaid =
        data.brokerageIsPaid === 'true' || data.brokerageIsPaid === true;

      await tx.brokerage_payments.create({
        data: {
          agreement_id: agreement.id,
          brokerage_type: data.brokerageType,
          brokerage_value: parseFloat(data.brokerageValue),
          brokerage_amount: brokerageAmount,
          is_paid: brokerageIsPaid,
          paid_on: brokerageIsPaid && data.brokeragePaidOn
            ? new Date(data.brokeragePaidOn)
            : null,
          payment_mode: brokerageIsPaid ? data.brokeragePaymentMode || null : null,
          cheque_number: data.brokerageChequeNumber || null,
          cheque_date: data.brokerageChequeDate
            ? new Date(data.brokerageChequeDate)
            : null,
          bank_name: data.brokerageBankName || null,
          cheque_photo: files?.brokerageChequePhoto?.[0]
            ? getFileUrl(files.brokerageChequePhoto[0].path)
            : null,
          remarks: data.brokerageRemarks || null,
        },
      });
    }

    // 6. Update property status to RENTED
    await tx.properties.update({
      where: { id: data.propertyId },
      data: { status: 'RENTED' },
    });

    return agreement;
  });

  const agreement = await fetchFullAgreement(result.id);

  // Fire-and-log: agreement creation email should not fail creation response.
  if (agreement?.tenants?.email) {
    try {
      await emailService.sendAgreementCreatedEmail({
        to: agreement.tenants.email,
        tenantName: agreement.tenants.full_name,
        propertyName: agreement.properties?.name || 'Property',
        startDate: agreement.start_date,
        endDate: agreement.end_date,
        durationMonths: agreement.duration_months,
        monthlyRent: agreement.monthly_rent,
        depositAmount: agreement.deposit_amount,
        rentDueDay: agreement.rent_due_day,
        gstApplicable: agreement.gst_applicable,
        gstPercent: agreement.gst_percent,
        gstBillingType: agreement.gst_billing_type,
        gstIsInclusive: agreement.gst_is_inclusive,
      });
    } catch (error) {
      logger.error(`Agreement created email failed for agreement ${agreement.id}: ${error.message}`);
    }
  }

  return agreement;
};

// ── Get All Agreements ────────────────────────────────────────────────────────

const getAllAgreements = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { status, propertyId, tenantId, brokerId } = query;

  const where = {};

  // USER role — only agreements for their accessible properties
  if (user.role === 'USER') {
    const accessList = await prisma.user_property_access.findMany({
      where: {
        user_id: user.id,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
      select: { property_id: true },
    });

    const ids = accessList.map((a) => a.property_id);
    if (ids.length === 0) {
      return { agreements: [], meta: getPaginationMeta(0, page, limit) };
    }
    where.property_id = { in: ids };
  }

  if (status) where.status = status;
  if (propertyId) where.property_id = propertyId;
  if (tenantId) where.tenant_id = tenantId;
  if (brokerId) where.broker_id = brokerId;

  const [agreements, total] = await Promise.all([
    prisma.agreements.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        properties: {
          select: { id: true, name: true, address: true, status: true },
        },
        tenants: {
          select: { id: true, full_name: true, email: true, whats_app_no: true },
        },
        brokers: {
          select: { id: true, name: true, contact_no: true },
        },
        deposit_payments: {
          select: { id: true, amount: true, received_on: true, payment_mode: true },
        },
        brokerage_payments: {
          select: {
            id: true,
            brokerage_amount: true,
            is_paid: true,
            paid_on: true,
          },
        },
        _count: {
          select: { rent_ledgers: true, payments: true },
        },
      },
    }),
    prisma.agreements.count({ where }),
  ]);

  return { agreements, meta: getPaginationMeta(total, page, limit) };
};

// ── Get Agreement By ID ───────────────────────────────────────────────────────

const getAgreementById = async (id, user) => {
  // USER role — verify they have access to the property
  if (user && user.role === 'USER') {
    const agreement = await prisma.agreements.findUnique({
      where: { id },
      select: { property_id: true },
    });

    if (!agreement) throw new AppError('Agreement not found.', 404);

    const access = await prisma.user_property_access.findFirst({
      where: {
        user_id: user.id,
        property_id: agreement.property_id,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
    });

    if (!access) throw new AppError('You do not have access to this agreement.', 403);
  }

  const agreement = await fetchFullAgreement(id);

  if (!agreement) throw new AppError('Agreement not found.', 404);

  return agreement;
};

// ── Update Agreement PDF ──────────────────────────────────────────────────────

const updateAgreementPdf = async (id, file) => {
  if (!file) throw new AppError('Agreement PDF file is required.', 400);

  const agreement = await prisma.agreements.findUnique({ where: { id } });

  if (!agreement) {
    deleteFile(file.path);
    throw new AppError('Agreement not found.', 404);
  }

  if (agreement.agreement_pdf) {
    deleteFile(agreement.agreement_pdf);
  }

  const updated = await prisma.agreements.update({
    where: { id },
    data: { agreement_pdf: getFileUrl(file.path) },
    select: { id: true, agreement_pdf: true, updated_at: true },
  });

  return updated;
};

// ── Terminate Agreement ───────────────────────────────────────────────────────

const terminateAgreement = async (id, data) => {
  const agreement = await prisma.agreements.findUnique({
    where: { id },
    select: { id: true, status: true, property_id: true },
  });

  if (!agreement) throw new AppError('Agreement not found.', 404);

  if (agreement.status !== 'ACTIVE') {
    throw new AppError(
      `Agreement is already ${agreement.status.toLowerCase()}. Cannot terminate.`,
      400
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.agreements.update({
      where: { id },
      data: {
        status: 'TERMINATED',
        terminated_at: new Date(),
        termination_reason: data.terminationReason,
      },
    });

    await tx.properties.update({
      where: { id: agreement.property_id },
      data: { status: 'VACANT' },
    });
  });

  const terminatedAgreement = await fetchFullAgreement(id);

  if (terminatedAgreement?.tenants?.email) {
    try {
      await emailService.sendAgreementTerminatedEmail({
        to: terminatedAgreement.tenants.email,
        tenantName: terminatedAgreement.tenants.full_name,
        propertyName: terminatedAgreement.properties?.name || 'Property',
        terminatedAt: terminatedAgreement.terminated_at,
        terminationReason: terminatedAgreement.termination_reason,
      });
    } catch (error) {
      logger.error(`Agreement termination email failed for agreement ${id}: ${error.message}`);
    }
  }

  return terminatedAgreement;
};

// ── Update / Add Deposit Payment ──────────────────────────────────────────────

const updateDepositPayment = async (agreementId, data, file) => {
  const agreement = await prisma.agreements.findUnique({
    where: { id: agreementId },
    include: { deposit_payments: true },
  });

  if (!agreement) {
    if (file) deleteFile(file.path);
    throw new AppError('Agreement not found.', 404);
  }

  const existing = agreement.deposit_payments;

  const paymentData = {
    amount: parseFloat(data.amount),
    received_on: new Date(data.receivedOn),
    payment_mode: data.paymentMode,
    cheque_number: data.chequeNumber || null,
    cheque_date: data.chequeDate ? new Date(data.chequeDate) : null,
    bank_name: data.bankName || null,
    remarks: data.remarks || null,
  };

  // Handle cheque photo
  if (file) {
    if (existing?.cheque_photo) deleteFile(existing.cheque_photo);
    paymentData.cheque_photo = getFileUrl(file.path);
  }

  let deposit;

  if (existing) {
    deposit = await prisma.deposit_payments.update({
      where: { agreement_id: agreementId },
      data: paymentData,
    });
  } else {
    deposit = await prisma.deposit_payments.create({
      data: { ...paymentData, agreement_id: agreementId },
    });
  }

  return deposit;
};

// ── Update / Add Brokerage Payment ────────────────────────────────────────────

const updateBrokeragePayment = async (agreementId, data, file) => {
  const agreement = await prisma.agreements.findUnique({
    where: { id: agreementId },
    include: { brokerage_payments: true },
  });

  if (!agreement) {
    if (file) deleteFile(file.path);
    throw new AppError('Agreement not found.', 404);
  }

  if (!agreement.broker_id) {
    if (file) deleteFile(file.path);
    throw new AppError('This agreement has no broker linked to it.', 400);
  }

  const existing = agreement.brokerage_payments;
  const brokerageAmount = calculateBrokerageAmount(
    data.brokerageType,
    data.brokerageValue,
    agreement.monthly_rent
  );
  const isPaid = data.isPaid === 'true' || data.isPaid === true;

  const paymentData = {
    brokerage_type: data.brokerageType,
    brokerage_value: parseFloat(data.brokerageValue),
    brokerage_amount: brokerageAmount,
    is_paid: isPaid,
    paid_on: isPaid && data.paidOn ? new Date(data.paidOn) : null,
    payment_mode: isPaid ? data.paymentMode || null : null,
    cheque_number: data.chequeNumber || null,
    cheque_date: data.chequeDate ? new Date(data.chequeDate) : null,
    bank_name: data.bankName || null,
    remarks: data.remarks || null,
  };

  // Handle cheque photo
  if (file) {
    if (existing?.cheque_photo) deleteFile(existing.cheque_photo);
    paymentData.cheque_photo = getFileUrl(file.path);
  }

  let brokerage;

  if (existing) {
    brokerage = await prisma.brokerage_payments.update({
      where: { agreement_id: agreementId },
      data: paymentData,
    });
  } else {
    brokerage = await prisma.brokerage_payments.create({
      data: { ...paymentData, agreement_id: agreementId },
    });
  }

  return brokerage;
};

// ── Get Agreement Ledgers ─────────────────────────────────────────────────────

const getAgreementLedgers = async (agreementId, user) => {
  const agreement = await prisma.agreements.findUnique({
    where: { id: agreementId },
    select: { id: true, property_id: true },
  });

  if (!agreement) throw new AppError('Agreement not found.', 404);

  if (user.role === 'USER') {
    const access = await prisma.user_property_access.findFirst({
      where: {
        user_id: user.id,
        property_id: agreement.property_id,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
    });
    if (!access) throw new AppError('You do not have access to this agreement.', 403);
  }

  const ledgers = await prisma.rent_ledgers.findMany({
    where: { agreement_id: agreementId },
    orderBy: { ledger_month: 'asc' },
    include: {
      agreement_rent_cycles: {
        select: { cycle_number: true, monthly_rent: true },
      },
      payments: {
        orderBy: { received_on: 'asc' },
        select: {
          id: true,
          amount: true,
          payment_mode: true,
          received_on: true,
          is_advance: true,
          remarks: true,
        },
      },
    },
  });

  return ledgers;
};

module.exports = {
  createAgreement,
  getAllAgreements,
  getAgreementById,
  updateAgreementPdf,
  terminateAgreement,
  updateDepositPayment,
  updateBrokeragePayment,
  getAgreementLedgers,
};