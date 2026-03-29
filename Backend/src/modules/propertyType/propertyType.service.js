const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

// ── Helper: Convert camelCase to snake_case ──────────────────────────────────

const toSnakeCase = (obj) => {
  const result = {};
  const camelToSnake = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[camelToSnake(key)] = obj[key];
    }
  }
  return result;
};

// ── Create ───────────────────────────────────────────────────────────────────

const createPropertyType = async (data) => {
  const existing = await prisma.property_types.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new AppError(`Property type "${data.name}" already exists.`, 409);
  }

  const propertyType = await prisma.property_types.create({
    data: {
      name: data.name,
      description: data.description || null,
    },
  });

  return propertyType;
};

// ── Get All ──────────────────────────────────────────────────────────────────

const getAllPropertyTypes = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { search, isActive } = query;

  const where = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const [propertyTypes, total] = await Promise.all([
    prisma.property_types.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.property_types.count({ where }),
  ]);

  return {
    propertyTypes,
    meta: getPaginationMeta(total, page, limit),
  };
};

// ── Get All Active (dropdown use) ────────────────────────────────────────────

const getActivePropertyTypes = async () => {
  const propertyTypes = await prisma.property_types.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, description: true },
  });

  return propertyTypes;
};

// ── Get By ID ────────────────────────────────────────────────────────────────

const getPropertyTypeById = async (id) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(`Invalid ID format. Expected UUID, got "${id}".`, 400);
  }

  const propertyType = await prisma.property_types.findUnique({
    where: { id },
    include: {
      _count: {
        select: { properties: true },
      },
    },
  });

  if (!propertyType) {
    throw new AppError('Property type not found.', 404);
  }

  return propertyType;
};

// ── Update ───────────────────────────────────────────────────────────────────

const updatePropertyType = async (id, data) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(`Invalid ID format. Expected UUID, got "${id}".`, 400);
  }

  const propertyType = await prisma.property_types.findUnique({ where: { id } });

  if (!propertyType) {
    throw new AppError('Property type not found.', 404);
  }

  if (data.name && data.name !== propertyType.name) {
    const existing = await prisma.property_types.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new AppError(`Property type "${data.name}" already exists.`, 409);
    }
  }

  // Convert camelCase fields to snake_case for Prisma
  const dbData = toSnakeCase(data);

  const updated = await prisma.property_types.update({
    where: { id },
    data: dbData,
  });

  return updated;
};

// ── Delete ───────────────────────────────────────────────────────────────────

const deletePropertyType = async (id) => {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new AppError(`Invalid ID format. Expected UUID, got "${id}".`, 400);
  }

  const propertyType = await prisma.property_types.findUnique({
    where: { id },
    include: { _count: { select: { properties: true } } },
  });

  if (!propertyType) {
    throw new AppError('Property type not found.', 404);
  }

  if (propertyType._count.properties > 0) {
    throw new AppError(
      'Cannot delete this property type as it is linked to one or more properties.',
      400
    );
  }

  await prisma.property_types.delete({ where: { id } });
};

module.exports = {
  createPropertyType,
  getAllPropertyTypes,
  getActivePropertyTypes,
  getPropertyTypeById,
  updatePropertyType,
  deletePropertyType,
};