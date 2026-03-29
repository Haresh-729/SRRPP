const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const env = require('../config/env');

const authenticate = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication token missing.', 401));
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please login again.', 401));
    }
    return next(new AppError('Invalid token.', 401));
  }

  const user = await prisma.users.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true, is_active: true },
  });

  if (!user || !user.is_active) {
    return next(new AppError('User not found or account deactivated.', 401));
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
  };
  next();
});

module.exports = { authenticate };