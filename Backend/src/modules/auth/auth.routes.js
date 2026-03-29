const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const {
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
} = require('../../validators/auth.validator');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/login',         authLimiter, validate(loginSchema),        authController.login);
router.post('/refresh-token', authLimiter, validate(refreshTokenSchema), authController.refreshToken);

// ── Protected Routes ──────────────────────────────────────────────────────────
router.use(authenticate);

router.get('/me',              authController.getMe);
router.post('/logout',         authController.logout);
router.patch('/change-password', validate(changePasswordSchema), authController.changePassword);

module.exports = router;