const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const AppError = require('../../utils/AppError');
const env = require('../../config/env');

// ── Token Generators ─────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

const toApiUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active,
});

// ── Login ────────────────────────────────────────────────────────────────────

const login = async ({ email, password }) => {
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      is_active: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.is_active) {
    throw new AppError('Your account has been deactivated. Please contact the admin.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  // For USER role — check if they have any active property access
  if (user.role === 'USER') {
    const activeAccess = await prisma.user_property_access.findFirst({
      where: {
        user_id: user.id,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
    });

    if (!activeAccess) {
      throw new AppError(
        'You do not have any active property access. Please contact the admin.',
        403
      );
    }
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { password: _pw, ...userWithoutPassword } = user;

  return { user: toApiUser(userWithoutPassword), accessToken, refreshToken };
};

// ── Refresh Token ────────────────────────────────────────────────────────────

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired. Please login again.', 401);
    }
    throw new AppError('Invalid refresh token.', 401);
  }

  const user = await prisma.users.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true, is_active: true },
  });

  if (!user || !user.is_active) {
    throw new AppError('User not found or account deactivated.', 401);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return { user: toApiUser(user), accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ── Get Me ───────────────────────────────────────────────────────────────────

const getMe = async (userId) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      created_at: true,
      user_property_access: {
        where: {
          is_active: true,
          valid_from: { lte: new Date() },
          valid_to: { gte: new Date() },
        },
        select: {
          id: true,
          valid_from: true,
          valid_to: true,
          properties: {
            select: {
              id: true,
              name: true,
              address: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    propertyAccess: user.user_property_access.map((access) => ({
      id: access.id,
      validFrom: access.valid_from,
      validTo: access.valid_to,
      property: access.properties,
    })),
  };
};

// ── Change Password ──────────────────────────────────────────────────────────

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new AppError('New password cannot be the same as the current password.', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

module.exports = { login, refreshToken, getMe, changePassword };