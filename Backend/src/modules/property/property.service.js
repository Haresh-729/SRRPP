const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');
const { deleteFile, getFileUrl } = require('../../utils/fileHelper');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (id, fieldName = 'ID') => {
  if (!UUID_REGEX.test(id)) {
    throw new AppError(`Invalid ${fieldName} format. Expected UUID, got "${id}".`, 400);
  }
};

const mapPropertyType = (propertyType) => {
  if (!propertyType) return null;

  return {
    id: propertyType.id,
    name: propertyType.name,
    description: propertyType.description,
    isActive: propertyType.is_active,
    createdAt: propertyType.created_at,
    updatedAt: propertyType.updated_at,
  };
};

const mapTenant = (tenant) => {
  if (!tenant) return null;

  return {
    id: tenant.id,
    fullName: tenant.full_name,
    email: tenant.email,
    whatsAppNo: tenant.whats_app_no,
  };
};

const mapBroker = (broker) => {
  if (!broker) return null;

  return {
    id: broker.id,
    name: broker.name,
    contactNo: broker.contact_no,
  };
};

const mapAgreement = (agreement) => {
  if (!agreement) return null;

  return {
    id: agreement.id,
    startDate: agreement.start_date,
    endDate: agreement.end_date,
    monthlyRent: agreement.monthly_rent,
    tenant: mapTenant(agreement.tenants),
    broker: mapBroker(agreement.brokers),
    depositPayment: agreement.deposit_payments,
    brokeragePayment: agreement.brokerage_payments,
  };
};

const mapProperty = (property) => ({
  id: property.id,
  propertyTypeId: property.property_type_id,
  name: property.name,
  address: property.address,
  areaSqFt: property.area_sq_ft,
  purchaseDate: property.purchase_date,
  purchaseAmount: property.purchase_amount,
  purchaseAgreementPdf: property.purchase_agreement_pdf,
  status: property.status,
  isActive: property.is_active,
  createdAt: property.created_at,
  updatedAt: property.updated_at,
  propertyType: mapPropertyType(property.property_types),
  agreements: property.agreements ? property.agreements.map(mapAgreement) : undefined,
  _count: property._count,
});

const createProperty = async (data, file) => {
  assertUuid(data.propertyTypeId, 'property type ID');

  const propertyType = await prisma.property_types.findUnique({
    where: { id: data.propertyTypeId },
  });

  if (!propertyType || !propertyType.is_active) {
    if (file) deleteFile(file.path);
    throw new AppError('Property type not found or inactive.', 404);
  }

  const property = await prisma.properties.create({
    data: {
      property_type_id: data.propertyTypeId,
      name: data.name,
      address: data.address,
      area_sq_ft: Number(data.areaSqFt),
      purchase_date: new Date(data.purchaseDate),
      purchase_amount: Number(data.purchaseAmount),
      purchase_agreement_pdf: file ? getFileUrl(file.path) : null,
      status: 'VACANT',
    },
    include: {
      property_types: {
        select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
      },
    },
  });

  return mapProperty(property);
};

const getAllProperties = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { search, status, propertyTypeId, isActive } = query;

  const where = {};

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

    const accessiblePropertyIds = accessList.map((a) => a.property_id);

    if (accessiblePropertyIds.length === 0) {
      return {
        properties: [],
        meta: getPaginationMeta(0, page, limit),
      };
    }

    where.id = { in: accessiblePropertyIds };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (propertyTypeId) {
    assertUuid(propertyTypeId, 'property type ID');
    where.property_type_id = propertyTypeId;
  }

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const [properties, total] = await Promise.all([
    prisma.properties.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        property_types: {
          select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
        },
        agreements: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            start_date: true,
            end_date: true,
            monthly_rent: true,
            tenants: {
              select: { id: true, full_name: true, email: true, whats_app_no: true },
            },
          },
          take: 1,
        },
      },
    }),
    prisma.properties.count({ where }),
  ]);

  return {
    properties: properties.map(mapProperty),
    meta: getPaginationMeta(total, page, limit),
  };
};

const getPropertyById = async (id, user) => {
  assertUuid(id, 'property ID');

  if (user.role === 'USER') {
    const access = await prisma.user_property_access.findFirst({
      where: {
        user_id: user.id,
        property_id: id,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
    });

    if (!access) {
      throw new AppError('You do not have access to this property.', 403);
    }
  }

  const property = await prisma.properties.findUnique({
    where: { id },
    include: {
      property_types: {
        select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
      },
      agreements: {
        orderBy: { created_at: 'desc' },
        include: {
          tenants: {
            select: {
              id: true,
              full_name: true,
              email: true,
              whats_app_no: true,
            },
          },
          brokers: {
            select: { id: true, name: true, contact_no: true },
          },
          deposit_payments: true,
          brokerage_payments: true,
        },
      },
      _count: {
        select: { agreements: true },
      },
    },
  });

  if (!property) {
    throw new AppError('Property not found.', 404);
  }

  return mapProperty(property);
};

const updateProperty = async (id, data, file) => {
  assertUuid(id, 'property ID');

  const property = await prisma.properties.findUnique({ where: { id } });

  if (!property) {
    if (file) deleteFile(file.path);
    throw new AppError('Property not found.', 404);
  }

  if (data.propertyTypeId) {
    assertUuid(data.propertyTypeId, 'property type ID');
    const propertyType = await prisma.property_types.findUnique({
      where: { id: data.propertyTypeId },
    });

    if (!propertyType || !propertyType.is_active) {
      if (file) deleteFile(file.path);
      throw new AppError('Property type not found or inactive.', 404);
    }
  }

  const updateData = {
    ...(data.propertyTypeId && { property_type_id: data.propertyTypeId }),
    ...(data.name && { name: data.name }),
    ...(data.address && { address: data.address }),
    ...(data.areaSqFt && { area_sq_ft: Number(data.areaSqFt) }),
    ...(data.purchaseDate && { purchase_date: new Date(data.purchaseDate) }),
    ...(data.purchaseAmount && { purchase_amount: Number(data.purchaseAmount) }),
    ...(data.isActive !== undefined && { is_active: data.isActive }),
  };

  if (file) {
    if (property.purchase_agreement_pdf) {
      deleteFile(property.purchase_agreement_pdf);
    }
    updateData.purchase_agreement_pdf = getFileUrl(file.path);
  }

  const updated = await prisma.properties.update({
    where: { id },
    data: updateData,
    include: {
      property_types: {
        select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
      },
    },
  });

  return mapProperty(updated);
};

const deletePurchaseAgreementPdf = async (id) => {
  assertUuid(id, 'property ID');

  const property = await prisma.properties.findUnique({ where: { id } });

  if (!property) {
    throw new AppError('Property not found.', 404);
  }

  if (!property.purchase_agreement_pdf) {
    throw new AppError('No purchase agreement PDF found for this property.', 404);
  }

  deleteFile(property.purchase_agreement_pdf);

  await prisma.properties.update({
    where: { id },
    data: { purchase_agreement_pdf: null },
  });
};

const deleteProperty = async (id) => {
  assertUuid(id, 'property ID');

  const property = await prisma.properties.findUnique({
    where: { id },
    include: {
      _count: {
        select: { agreements: true },
      },
    },
  });

  if (!property) {
    throw new AppError('Property not found.', 404);
  }

  if (property._count.agreements > 0) {
    throw new AppError(
      'Cannot delete this property as it has associated agreements. Deactivate it instead.',
      400
    );
  }

  if (property.purchase_agreement_pdf) {
    deleteFile(property.purchase_agreement_pdf);
  }

  await prisma.properties.delete({ where: { id } });
};

const getPropertySummary = async (user) => {
  const where = { is_active: true };

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
    if (ids.length === 0) return [];
    where.id = { in: ids };
  }

  const properties = await prisma.properties.findMany({
    where,
    orderBy: { name: 'asc' },
    select: {
      id: true,
      property_type_id: true,
      name: true,
      address: true,
      status: true,
      is_active: true,
      property_types: {
        select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
      },
    },
  });

  return properties.map(mapProperty);
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deletePurchaseAgreementPdf,
  deleteProperty,
  getPropertySummary,
};
