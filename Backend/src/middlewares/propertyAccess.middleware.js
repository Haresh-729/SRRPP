const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const checkPropertyAccess = catchAsync(async (req, _res, next) => {
  if (req.user.role === 'ADMIN') return next();

  const propertyId = req.params.propertyId || req.body.propertyId;

  if (!propertyId) {
    return next(new AppError('Property ID is required.', 400));
  }

  const access = await prisma.user_property_access.findFirst({
    where: {
      user_id: req.user.id,
      property_id: propertyId,
      is_active: true,
      valid_from: { lte: new Date() },
      valid_to: { gte: new Date() },
    },
  });

  if (!access) {
    return next(new AppError('You do not have access to this property.', 403));
  }

  next();
});

module.exports = { checkPropertyAccess };