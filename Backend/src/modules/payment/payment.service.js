const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { deleteFile, getFileUrl } = require('../../utils/fileHelper');

// ── Internal: resolve ledger status after payment ─────────────────────────────

const resolveLedgerStatus = (totalDue, paidAmount) => {
  const due = parseFloat(totalDue);
  const paid = parseFloat(paidAmount);
  if (paid <= 0) return 'PENDING';
  if (paid >= due) return 'PAID';
  return 'PARTIAL';
};

// ── Internal: carry balance forward to next ledger ────────────────────────────

const carryBalanceForward = async (tx, agreementId, currentLedgerMonth, balanceCarried) => {
  // Find next month in ledger sequence for this agreement
  const allLedgers = await tx.rent_ledgers.findMany({
    where: { agreement_id: agreementId },
    orderBy: { ledger_month: 'asc' },
    select: { id: true, ledger_month: true, rent_amount: true, status: true },
  });

  const currentIndex = allLedgers.findIndex((l) => l.ledger_month === currentLedgerMonth);
  const nextLedger = allLedgers[currentIndex + 1];

  if (!nextLedger) return; // Last month of agreement, no next ledger

  const newTotalDue = parseFloat(nextLedger.rent_amount) + parseFloat(balanceCarried);

  await tx.rent_ledgers.update({
    where: { id: nextLedger.id },
    data: {
      balance_from_previous: parseFloat(balanceCarried),
      total_due: newTotalDue,
      // If next ledger was already PAID/PARTIAL, recalculate with new total
      updated_at: new Date(),
    },
  });
};

// ── Internal: build payment data object ──────────────────────────────────────

const buildPaymentData = (data, file, ledger, isAdvance = false) => ({
  ledger_id: ledger.id,
  agreement_id: ledger.agreement_id,
  property_id: ledger.property_id,
  tenant_id: ledger.tenant_id,
  amount: parseFloat(data.amount),
  payment_mode: data.paymentMode,
  cheque_number: data.chequeNumber || null,
  cheque_date: data.chequeDate ? new Date(data.chequeDate) : null,
  bank_name: data.bankName || null,
  cheque_photo: file ? getFileUrl(file.path) : null,
  upi_transaction_id: data.upiTransactionId || null,
  received_on: new Date(data.receivedOn),
  is_advance: isAdvance,
  advance_for_month: isAdvance ? data.advanceForMonth : null,
  remarks: data.remarks || null,
});

// ── Record Rent Payment ───────────────────────────────────────────────────────

const recordPayment = async (ledgerId, data, file) => {
  const ledger = await prisma.rent_ledgers.findUnique({
    where: { id: ledgerId },
    include: {
      agreements: {
        select: { id: true, status: true },
      },
    },
  });

  if (!ledger) {
    if (file) deleteFile(file.path);
    throw new AppError('Rent ledger not found.', 404);
  }

  if (ledger.agreements.status !== 'ACTIVE') {
    if (file) deleteFile(file.path);
    throw new AppError('Cannot record payment for a non-active agreement.', 400);
  }

  if (ledger.status === 'PAID') {
    if (file) deleteFile(file.path);
    throw new AppError('This month rent is already fully paid.', 400);
  }

  const incomingAmount = parseFloat(data.amount);
  const currentPaid = parseFloat(ledger.paid_amount);
  const totalDue = parseFloat(ledger.total_due);

  // Overpayment guard
  if (currentPaid + incomingAmount > totalDue) {
    if (file) deleteFile(file.path);
    throw new AppError(
      `Payment amount exceeds outstanding balance of ₹${(totalDue - currentPaid).toFixed(2)}. Use advance payment for future months.`,
      400
    );
  }

  const newPaidAmount = currentPaid + incomingAmount;
  const newBalanceCarried = parseFloat((totalDue - newPaidAmount).toFixed(2));
  const newStatus = resolveLedgerStatus(totalDue, newPaidAmount);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create payment record
    const payment = await tx.payments.create({
      data: buildPaymentData(data, file, ledger, false),
    });

    // 2. Update current ledger
    await tx.rent_ledgers.update({
      where: { id: ledgerId },
      data: {
        paid_amount: newPaidAmount,
        balance_carried: newBalanceCarried,
        status: newStatus,
        updated_at: new Date(),
      },
    });

    // 3. If balance exists, carry it to next month's ledger
    if (newBalanceCarried > 0) {
      await carryBalanceForward(
        tx,
        ledger.agreement_id,
        ledger.ledger_month,
        newBalanceCarried
      );
    } else {
      // Balance fully cleared — ensure next month reflects 0 carry
      await carryBalanceForward(tx, ledger.agreement_id, ledger.ledger_month, 0);
    }

    return payment;
  });

  // Return updated ledger + payment
  return getPaymentById(result.id);
};

// ── Record Advance Payment ────────────────────────────────────────────────────

const recordAdvancePayment = async (agreementId, data, file) => {
  const agreement = await prisma.agreements.findUnique({
    where: { id: agreementId },
    select: { id: true, status: true },
  });

  if (!agreement) {
    if (file) deleteFile(file.path);
    throw new AppError('Agreement not found.', 404);
  }

  if (agreement.status !== 'ACTIVE') {
    if (file) deleteFile(file.path);
    throw new AppError('Cannot record advance payment for a non-active agreement.', 400);
  }

  // Find the target ledger for the advance month
  const targetLedger = await prisma.rent_ledgers.findUnique({
    where: {
      agreement_id_ledger_month: {
        agreement_id: agreementId,
        ledger_month: data.advanceForMonth,
      },
    },
  });

  if (!targetLedger) {
    if (file) deleteFile(file.path);
    throw new AppError(
      `No ledger found for month ${data.advanceForMonth} in this agreement.`,
      404
    );
  }

  if (targetLedger.status === 'PAID') {
    if (file) deleteFile(file.path);
    throw new AppError(
      `Rent for ${data.advanceForMonth} is already fully paid.`,
      400
    );
  }

  const incomingAmount = parseFloat(data.amount);
  const currentPaid = parseFloat(targetLedger.paid_amount);
  const totalDue = parseFloat(targetLedger.total_due);

  if (currentPaid + incomingAmount > totalDue) {
    if (file) deleteFile(file.path);
    throw new AppError(
      `Advance payment exceeds outstanding balance of ₹${(totalDue - currentPaid).toFixed(2)} for ${data.advanceForMonth}.`,
      400
    );
  }

  const newPaidAmount = currentPaid + incomingAmount;
  const newBalanceCarried = parseFloat((totalDue - newPaidAmount).toFixed(2));
  const newStatus = resolveLedgerStatus(totalDue, newPaidAmount);

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create advance payment record
    const payment = await tx.payments.create({
      data: buildPaymentData(data, file, targetLedger, true),
    });

    // 2. Update target ledger
    await tx.rent_ledgers.update({
      where: { id: targetLedger.id },
      data: {
        paid_amount: newPaidAmount,
        balance_carried: newBalanceCarried,
        status: newStatus,
        updated_at: new Date(),
      },
    });

    // 3. Carry balance forward if partial
    if (newBalanceCarried > 0) {
      await carryBalanceForward(
        tx,
        agreementId,
        targetLedger.ledger_month,
        newBalanceCarried
      );
    } else {
      await carryBalanceForward(tx, agreementId, targetLedger.ledger_month, 0);
    }

    return payment;
  });

  return getPaymentById(result.id);
};

// ── Get Payment By ID ─────────────────────────────────────────────────────────

const getPaymentById = async (id) => {
  const payment = await prisma.payments.findUnique({
    where: { id },
    include: {
      rent_ledgers: {
        select: {
          id: true,
          ledger_month: true,
          rent_amount: true,
          total_due: true,
          paid_amount: true,
          balance_carried: true,
          status: true,
          due_date: true,
        },
      },
      agreements: {
        select: {
          id: true,
          monthly_rent: true,
          start_date: true,
          end_date: true,
        },
      },
      properties: {
        select: { id: true, name: true, address: true },
      },
      tenants: {
        select: { id: true, full_name: true, email: true, whats_app_no: true },
      },
    },
  });

  if (!payment) throw new AppError('Payment not found.', 404);

  return payment;
};

// ── Get All Payments ──────────────────────────────────────────────────────────

const getAllPayments = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate } = query;

  const where = {};

  // USER role — restrict to accessible properties
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
      return { payments: [], meta: getPaginationMeta(0, page, limit) };
    }
    where.property_id = { in: ids };
  }

  if (agreementId) where.agreement_id = agreementId;
  if (tenantId) where.tenant_id = tenantId;
  if (propertyId) where.property_id = propertyId;
  if (paymentMode) where.payment_mode = paymentMode;
  if (isAdvance !== undefined) where.is_advance = isAdvance === 'true';

  if (fromDate || toDate) {
    where.received_on = {};
    if (fromDate) where.received_on.gte = new Date(fromDate);
    if (toDate) where.received_on.lte = new Date(toDate);
  }

  const [payments, total] = await Promise.all([
    prisma.payments.findMany({
      where,
      skip,
      take: limit,
      orderBy: { received_on: 'desc' },
      include: {
        rent_ledgers: {
          select: {
            id: true,
            ledger_month: true,
            total_due: true,
            paid_amount: true,
            balance_carried: true,
            status: true,
          },
        },
        properties: {
          select: { id: true, name: true },
        },
        tenants: {
          select: { id: true, full_name: true, email: true },
        },
      },
    }),
    prisma.payments.count({ where }),
  ]);

  return { payments, meta: getPaginationMeta(total, page, limit) };
};

// ── Get Payments By Ledger ────────────────────────────────────────────────────

const getPaymentsByLedger = async (ledgerId) => {
  const ledger = await prisma.rent_ledgers.findUnique({
    where: { id: ledgerId },
    include: {
      payments: {
        orderBy: { received_on: 'asc' },
        include: {
          properties: { select: { id: true, name: true } },
          tenants: { select: { id: true, full_name: true, email: true } },
        },
      },
      agreement_rent_cycles: {
        select: { cycle_number: true, monthly_rent: true },
      },
    },
  });

  if (!ledger) throw new AppError('Rent ledger not found.', 404);

  return ledger;
};

// ── Get All Ledgers ───────────────────────────────────────────────────────────

const getAllLedgers = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { agreementId, propertyId, tenantId, status, month } = query;

  const where = {};

  // USER role — restrict to accessible properties
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
      return { ledgers: [], meta: getPaginationMeta(0, page, limit) };
    }
    where.property_id = { in: ids };
  }

  if (agreementId) where.agreement_id = agreementId;
  if (propertyId) where.property_id = propertyId;
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (month) where.ledger_month = month;

  const [ledgers, total] = await Promise.all([
    prisma.rent_ledgers.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ ledger_month: 'desc' }],
      include: {
        properties: {
          select: { id: true, name: true },
        },
        tenants: {
          select: { id: true, full_name: true, email: true, whats_app_no: true },
        },
        agreements: {
          select: {
            id: true,
            monthly_rent: true,
            rent_due_day: true,
            status: true,
          },
        },
        _count: { select: { payments: true } },
      },
    }),
    prisma.rent_ledgers.count({ where }),
  ]);

  return { ledgers, meta: getPaginationMeta(total, page, limit) };
};

// ── Get Ledger By ID ──────────────────────────────────────────────────────────

const getLedgerById = async (id) => {
  const ledger = await prisma.rent_ledgers.findUnique({
    where: { id },
    include: {
      agreements: {
        select: {
          id: true,
          monthly_rent: true,
          rent_due_day: true,
          start_date: true,
          end_date: true,
          status: true,
        },
      },
      properties: {
        select: { id: true, name: true, address: true },
      },
      tenants: {
        select: { id: true, full_name: true, email: true, whats_app_no: true },
      },
      agreement_rent_cycles: {
        select: { cycle_number: true, monthly_rent: true, start_date: true, end_date: true },
      },
      payments: {
        orderBy: { received_on: 'asc' },
        select: {
          id: true,
          amount: true,
          payment_mode: true,
          cheque_number: true,
          cheque_date: true,
          bank_name: true,
          cheque_photo: true,
          upi_transaction_id: true,
          received_on: true,
          is_advance: true,
          advance_for_month: true,
          remarks: true,
          created_at: true,
        },
      },
    },
  });

  if (!ledger) throw new AppError('Rent ledger not found.', 404);

  return ledger;
};

// ── Mark Overdue Ledgers ──────────────────────────────────────────────────────
// Called by cron — marks all unpaid/partial past-due ledgers as OVERDUE

const markOverdueLedgers = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updated = await prisma.rent_ledgers.updateMany({
    where: {
      status: { in: ['PENDING', 'PARTIAL'] },
      due_date: { lt: today },
      agreements: { status: 'ACTIVE' },
    },
    data: { status: 'OVERDUE' },
  });

  return updated.count;
};

module.exports = {
  recordPayment,
  recordAdvancePayment,
  getPaymentById,
  getAllPayments,
  getPaymentsByLedger,
  getAllLedgers,
  getLedgerById,
  markOverdueLedgers,
};