const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const { getPagination, getPaginationMeta } = require('../../utils/pagination');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assertUuid = (id, fieldName = 'ID') => {
  if (!UUID_REGEX.test(id)) {
    throw new AppError(`Invalid ${fieldName} format. Expected UUID, got "${id}".`, 400);
  }
};

const mapProperty = (property) => {
  if (!property) return null;

  return {
    id: property.id,
    name: property.name,
    address: property.address,
    status: property.status,
    isActive: property.is_active,
    propertyType: property.property_types
      ? {
          id: property.property_types.id,
          name: property.property_types.name,
        }
      : undefined,
  };
};

const mapAccess = (access) => ({
  id: access.id,
  userId: access.user_id,
  propertyId: access.property_id,
  validFrom: access.valid_from,
  validTo: access.valid_to,
  isActive: access.is_active,
  createdAt: access.created_at,
  updatedAt: access.updated_at,
  property: mapProperty(access.properties),
});

const mapUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

// ── Create User ──────────────────────────────────────────────────────────────

const createUser = async (data) => {
  const existing = await prisma.users.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.users.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'USER',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return mapUser(user);
};

// ── Get All Users ─────────────────────────────────────────────────────────────

const getAllUsers = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const { search, isActive } = query;

  const where = { role: 'USER' };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        created_at: true,
        user_property_access: {
          where: { is_active: true },
          select: {
            id: true,
            user_id: true,
            property_id: true,
            valid_from: true,
            valid_to: true,
            is_active: true,
            created_at: true,
            updated_at: true,
            properties: {
              select: {
                id: true,
                name: true,
                status: true,
                is_active: true,
              },
            },
          },
        },
      },
    }),
    prisma.users.count({ where }),
  ]);

  return {
    users: users.map((user) => ({
      ...mapUser(user),
      propertyAccess: user.user_property_access.map(mapAccess),
    })),
    meta: getPaginationMeta(total, page, limit),
  };
};

// ── Get User By ID ────────────────────────────────────────────────────────────

const getUserById = async (id) => {
  assertUuid(id, 'user ID');

  const user = await prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      updated_at: true,
      user_property_access: {
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          user_id: true,
          property_id: true,
          valid_from: true,
          valid_to: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          properties: {
            select: {
              id: true,
              name: true,
              address: true,
              status: true,
              is_active: true,
              property_types: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  return {
    ...mapUser(user),
    propertyAccess: user.user_property_access.map(mapAccess),
  };
};

// ── Update User ───────────────────────────────────────────────────────────────

const updateUser = async (id, data) => {
  assertUuid(id, 'user ID');

  const user = await prisma.users.findUnique({ where: { id } });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  if (Object.keys(updateData).length === 0) {
    throw new AppError('At least one valid field must be provided to update.', 400);
  }

  const updated = await prisma.users.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      updated_at: true,
    },
  });

  return mapUser(updated);
};

// ── Reset User Password (Admin) ───────────────────────────────────────────────

const resetUserPassword = async (id, newPassword) => {
  assertUuid(id, 'user ID');

  const user = await prisma.users.findUnique({ where: { id } });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { id },
    data: { password: hashedPassword },
  });
};

// ── Assign Property Access ────────────────────────────────────────────────────

const assignPropertyAccess = async (userId, data) => {
  assertUuid(userId, 'user ID');
  assertUuid(data.propertyId, 'property ID');

  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  if (!user.is_active) {
    throw new AppError('Cannot assign access to a deactivated user.', 400);
  }

  const property = await prisma.properties.findUnique({
    where: { id: data.propertyId },
  });

  if (!property || !property.is_active) {
    throw new AppError('Property not found or inactive.', 404);
  }

  // Check if access already exists for this user-property pair
  const existing = await prisma.user_property_access.findUnique({
    where: {
      user_id_property_id: {
        user_id: userId,
        property_id: data.propertyId,
      },
    },
  });

  if (existing) {
    // Update existing access instead of throwing error
    const updated = await prisma.user_property_access.update({
      where: {
        user_id_property_id: {
          user_id: userId,
          property_id: data.propertyId,
        },
      },
      data: {
        valid_from: new Date(data.validFrom),
        valid_to: new Date(data.validTo),
        is_active: true,
      },
      include: {
        properties: {
          select: { id: true, name: true, status: true, is_active: true },
        },
      },
    });

    return mapAccess(updated);
  }

  const access = await prisma.user_property_access.create({
    data: {
      user_id: userId,
      property_id: data.propertyId,
      valid_from: new Date(data.validFrom),
      valid_to: new Date(data.validTo),
    },
    include: {
      properties: {
        select: { id: true, name: true, status: true, is_active: true },
      },
    },
  });

  return mapAccess(access);
};

// ── Update Property Access ────────────────────────────────────────────────────

const updatePropertyAccess = async (accessId, data) => {
  assertUuid(accessId, 'access ID');

  const access = await prisma.user_property_access.findUnique({
    where: { id: accessId },
  });

  if (!access) {
    throw new AppError('Property access record not found.', 404);
  }

  // Validate date range if both provided
  const validFromDate = data.validFrom ? new Date(data.validFrom) : access.valid_from;
  const validToDate = data.validTo ? new Date(data.validTo) : access.valid_to;
  if (validToDate <= validFromDate) {
    throw new AppError('Valid to date must be after valid from date.', 400);
  }

  const updated = await prisma.user_property_access.update({
    where: { id: accessId },
    data: {
      ...(data.validFrom && { valid_from: new Date(data.validFrom) }),
      ...(data.validTo && { valid_to: new Date(data.validTo) }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
    },
    include: {
      properties: {
        select: { id: true, name: true, status: true, is_active: true },
      },
    },
  });

  return mapAccess(updated);
};

// ── Revoke Property Access ────────────────────────────────────────────────────

const revokePropertyAccess = async (accessId) => {
  assertUuid(accessId, 'access ID');

  const access = await prisma.user_property_access.findUnique({
    where: { id: accessId },
  });

  if (!access) {
    throw new AppError('Property access record not found.', 404);
  }

  await prisma.user_property_access.update({
    where: { id: accessId },
    data: { is_active: false },
  });
};

// ── Get All Access For A User ─────────────────────────────────────────────────

const getUserPropertyAccess = async (userId) => {
  assertUuid(userId, 'user ID');

  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  const access = await prisma.user_property_access.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    include: {
      properties: {
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
          is_active: true,
          property_types: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return access.map(mapAccess);
};

// ── Delete User ───────────────────────────────────────────────────────────────

const deleteUser = async (id) => {
  assertUuid(id, 'user ID');

  const user = await prisma.users.findUnique({ where: { id } });

  if (!user || user.role !== 'USER') {
    throw new AppError('User not found.', 404);
  }

  // Revoke all property access first
  await prisma.user_property_access.updateMany({
    where: { user_id: id },
    data: { is_active: false },
  });

  // Deactivate instead of hard delete to preserve audit trail
  await prisma.users.update({
    where: { id },
    data: { is_active: false },
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  assignPropertyAccess,
  updatePropertyAccess,
  revokePropertyAccess,
  getUserPropertyAccess,
  deleteUser,
};