const logger = require('../config/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  let { statusCode = 500, message, isOperational } = err;

  logger.error(`[${req.method}] ${req.originalUrl} | ${statusCode} | ${message}`, {
    stack: err.stack,
  });

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists.';
    isOperational = true;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found.';
    isOperational = true;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired.';
    isOperational = true;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds the allowed limit.';
    isOperational = true;
  }

  if (!isOperational) {
    return res.status(500).json({
      success: false,
      message: env.NODE_ENV === 'production' ? 'Internal server error.' : message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  return res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };