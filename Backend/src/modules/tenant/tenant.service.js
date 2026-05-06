const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { uploadToS3, deleteFromS3, buildTenantKey, getPresignedUrl } = require('../../utils/s3');
const emailService = require('../notifications/email.service');
const logger = require('../../config/logger');

// ────────────────────────────────────────────────────────────────────────────
// ── Utilities
// ────────────────────────────────────────────────────────────────────────────

const assertUuid = (id, fieldName = 'id') => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(`Invalid ${fieldName} format.`, 400);
  }
};

const mapBroker = (broker) => {
  if (!broker) return null;
  return {
    id: broker.id,
    name: broker.name,
    contactNo: broker.contact_no,
    email: broker.email,
    address: broker.address,
    isActive: broker.is_active,
    createdAt: broker.created_at,
    updatedAt: broker.updated_at,
  };
};

const mapAgreement = (agreement) => {
  if (!agreement) return null;
  return {
    id: agreement.id,
    propertyId: agreement.property_id,
    durationMonths: agreement.duration_months,
    startDate: agreement.start_date,
    endDate: agreement.end_date,
    monthlyRent: agreement.monthly_rent,
    rentEscalationPercent: agreement.rent_escalation_percent,
    rentDueDay: agreement.rent_due_day,
    depositAmount: agreement.deposit_amount,
    status: agreement.status,
    terminatedAt: agreement.terminated_at,
    terminationReason: agreement.termination_reason,
    createdAt: agreement.created_at,
    updatedAt: agreement.updated_at,
  };
};

const mapTenant = (tenant) => {
  if (!tenant) return null;
  return {
    id: tenant.id,
    fullName: tenant.full_name,
    email: tenant.email,
    whatsAppNo: tenant.whats_app_no,
    dob: tenant.dob,
    aadharPhoto: tenant.aadhar_photo,
    panPhoto: tenant.pan_photo,
    permanentAddress: tenant.permanent_address,
    isActive: tenant.is_active,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  };
};

// ────────────────────────────────────────────────────────────────────────────
// ── Create Tenant
// ────────────────────────────────────────────────────────────────────────────

const createTenant = async (data, files) => {
  if (!files?.aadharPhoto?.[0]) throw new AppError('Aadhar card photo is required.', 400);
  if (!files?.panPhoto?.[0]) throw new AppError('PAN card photo is required.', 400);

  const existing = await prisma.tenants.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('A tenant with this email already exists.', 409);

  const tenant = await prisma.tenants.create({
    data: {
      full_name: data.fullName,
      email: data.email,
      whats_app_no: data.whatsAppNo,
      dob: new Date(data.dob),
      permanent_address: data.permanentAddress,
      aadhar_photo: null,
      pan_photo: null,
    },
  });

  const aadharFile = files.aadharPhoto[0];
  const panFile = files.panPhoto[0];
  const aadharKey = buildTenantKey(tenant.id, 'aadhar', aadharFile.originalname);
  const panKey = buildTenantKey(tenant.id, 'pan', panFile.originalname);

  await uploadToS3(aadharFile.buffer, aadharKey, aadharFile.mimetype);
  await uploadToS3(panFile.buffer, panKey, panFile.mimetype);

  await prisma.tenants.update({
    where: { id: tenant.id },
    data: { aadhar_photo: aadharKey, pan_photo: panKey },
  });

  if (tenant.email) {
    try {
      await emailService.sendTenantWelcomeEmail({
        to: tenant.email,
        tenantName: tenant.full_name,
        whatsAppNo: tenant.whats_app_no,
        permanentAddress: tenant.permanent_address,
        dob: tenant.dob,
      });
    } catch (error) {
      logger.error(`Tenant welcome email failed for tenant ${tenant.id}: ${error.message}`);
    }
  }

  return mapTenant({ ...tenant, aadhar_photo: aadharKey, pan_photo: panKey });
};

// ────────────────────────────────────────────────────────────────────────────
// ── Get All Tenants
// ────────────────────────────────────────────────────────────────────────────

const getAllTenants = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { search, isActive } = query;

  const where = {};

  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { whats_app_no: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const [tenants, total] = await Promise.all([
    prisma.tenants.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        full_name: true,
        email: true,
        whats_app_no: true,
        dob: true,
        permanent_address: true,
        is_active: true,
        created_at: true,
        agreements: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            start_date: true,
            end_date: true,
            monthly_rent: true,
            properties: {
              select: { id: true, name: true, address: true },
            },
          },
          take: 1,
        },
      },
    }),
    prisma.tenants.count({ where }),
  ]);

  const mappedTenants = tenants.map((tenant) => ({
    ...mapTenant(tenant),
    agreements: tenant.agreements.map((a) => ({
      id: a.id,
      startDate: a.start_date,
      endDate: a.end_date,
      monthlyRent: a.monthly_rent,
      property: {
        id: a.properties.id,
        name: a.properties.name,
        address: a.properties.address,
      },
    })),
  }));

  return {
    tenants: mappedTenants,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ────────────────────────────────────────────────────────────────────────────
// ── Get Tenant By ID
// ────────────────────────────────────────────────────────────────────────────

const getTenantById = async (id) => {
  assertUuid(id);

  const tenant = await prisma.tenants.findUnique({
    where: { id },
    include: {
      agreements: {
        orderBy: { created_at: 'desc' },
        include: {
          properties: {
            select: {
              id: true,
              name: true,
              address: true,
              property_types: {
                select: { id: true, name: true },
              },
            },
          },
          brokers: {
            select: { id: true, name: true, contact_no: true },
          },
          brokerage_payments: true,
          deposit_payments: true,
          agreement_rent_cycles: {
            orderBy: { cycle_number: 'asc' },
          },
        },
      },
      _count: {
        select: { agreements: true, payments: true },
      },
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found.', 404);
  }

  // Return short-lived view URLs so clients can render private bucket objects directly.
  const [aadharPhotoUrl, panPhotoUrl] = await Promise.all([
    tenant.aadhar_photo ? getPresignedUrl(tenant.aadhar_photo, 3600).catch(() => null) : Promise.resolve(null),
    tenant.pan_photo ? getPresignedUrl(tenant.pan_photo, 3600).catch(() => null) : Promise.resolve(null),
  ]);

  return {
    ...mapTenant(tenant),
    aadharPhoto: aadharPhotoUrl || tenant.aadhar_photo,
    panPhoto: panPhotoUrl || tenant.pan_photo,
    agreements: tenant.agreements.map((a) => ({
      ...mapAgreement(a),
      property: a.properties ? {
        id: a.properties.id,
        name: a.properties.name,
        address: a.properties.address,
        propertyType: a.properties.property_types ? {
          id: a.properties.property_types.id,
          name: a.properties.property_types.name,
        } : null,
      } : null,
      broker: mapBroker(a.brokers),
      brokeragePayment: a.brokerage_payments,
      depositPayment: a.deposit_payments,
      rentCycles: a.agreement_rent_cycles.map((rc) => ({
        id: rc.id,
        agreementId: rc.agreement_id,
        cycleNumber: rc.cycle_number,
        startDate: rc.start_date,
        endDate: rc.end_date,
        monthlyRent: rc.monthly_rent,
        createdAt: rc.created_at,
      })),
    })),
    _count: tenant._count,
  };
};

// ────────────────────────────────────────────────────────────────────────────
// ── Update Tenant
// ────────────────────────────────────────────────────────────────────────────

const updateTenant = async (id, data, files) => {
  assertUuid(id);

  const tenant = await prisma.tenants.findUnique({ where: { id } });

  if (!tenant) {
    throw new AppError('Tenant not found.', 404);
  }

  // Check email uniqueness if being updated
  if (data.email && data.email !== tenant.email) {
    const existing = await prisma.tenants.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new AppError('A tenant with this email already exists.', 409);
    }
  }

  const updateData = {
    ...(data.fullName && { full_name: data.fullName }),
    ...(data.email && { email: data.email }),
    ...(data.whatsAppNo && { whats_app_no: data.whatsAppNo }),
    ...(data.dob && { dob: new Date(data.dob) }),
    ...(data.permanentAddress && { permanent_address: data.permanentAddress }),
    ...(data.isActive !== undefined && { is_active: data.isActive }),
  };

  if (files?.aadharPhoto?.[0]) {
    if (tenant.aadhar_photo) await deleteFromS3(tenant.aadhar_photo);
    const f = files.aadharPhoto[0];
    const key = buildTenantKey(id, 'aadhar', f.originalname);
    await uploadToS3(f.buffer, key, f.mimetype);
    updateData.aadhar_photo = key;
  }

  if (files?.panPhoto?.[0]) {
    if (tenant.pan_photo) await deleteFromS3(tenant.pan_photo);
    const f = files.panPhoto[0];
    const key = buildTenantKey(id, 'pan', f.originalname);
    await uploadToS3(f.buffer, key, f.mimetype);
    updateData.pan_photo = key;
  }

  const updated = await prisma.tenants.update({
    where: { id },
    data: updateData,
  });

  return mapTenant(updated);
};

// ────────────────────────────────────────────────────────────────────────────
// ── Delete Tenant Document
// ────────────────────────────────────────────────────────────────────────────

const deleteTenantDocument = async (id, docType) => {
  assertUuid(id);

  const tenant = await prisma.tenants.findUnique({ where: { id } });

  if (!tenant) {
    throw new AppError('Tenant not found.', 404);
  }

  const fieldMap = {
    aadhar: 'aadhar_photo',
    pan: 'pan_photo',
  };

  const field = fieldMap[docType];

  if (!field) {
    throw new AppError('Invalid document type. Use "aadhar" or "pan".', 400);
  }

  if (!tenant[field]) {
    throw new AppError(`No ${docType} document found for this tenant.`, 404);
  }

  // Check if tenant has active agreement — docs cannot be deleted then
  const activeAgreement = await prisma.agreements.findFirst({
    where: { tenant_id: id, status: 'ACTIVE' },
  });

  if (activeAgreement) {
    throw new AppError(
      'Cannot delete tenant documents while an active agreement exists.',
      400
    );
  }

  await deleteFromS3(tenant[field]);

  await prisma.tenants.update({
    where: { id },
    data: { [field]: null },
  });
};

// ────────────────────────────────────────────────────────────────────────────
// ── Get Tenant Summary (for dropdown)
// ────────────────────────────────────────────────────────────────────────────

const getTenantSummary = async () => {
  const tenants = await prisma.tenants.findMany({
    where: { is_active: true },
    orderBy: { full_name: 'asc' },
    select: {
      id: true,
      full_name: true,
      email: true,
      whats_app_no: true,
    },
  });

  return tenants.map((t) => ({
    id: t.id,
    fullName: t.full_name,
    email: t.email,
    whatsAppNo: t.whats_app_no,
  }));
};

// ────────────────────────────────────────────────────────────────────────────
// ── Delete Tenant
// ────────────────────────────────────────────────────────────────────────────

const deleteTenant = async (id) => {
  assertUuid(id);

  const tenant = await prisma.tenants.findUnique({
    where: { id },
    include: {
      _count: { select: { agreements: true } },
    },
  });

  if (!tenant) {
    throw new AppError('Tenant not found.', 404);
  }

  const activeAgreement = await prisma.agreements.findFirst({
    where: { tenant_id: id, status: 'ACTIVE' },
  });

  if (activeAgreement) {
    throw new AppError(
      'Cannot delete tenant with an active agreement. Deactivate the tenant instead.',
      400
    );
  }

  // Soft delete to preserve historical records
  await prisma.tenants.update({
    where: { id },
    data: { is_active: false },
  });
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenantDocument,
  getTenantSummary,
  deleteTenant,
};