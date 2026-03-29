const express = require('express');
const router = express.Router();

const userAccessController = require('./userAccess.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createUserSchema,
  updateUserSchema,
  assignPropertyAccessSchema,
  updatePropertyAccessSchema,
  resetPasswordSchema,
} = require('../../validators/userAccess.validator');

// All routes — Admin only
router.use(authenticate, authorize('ADMIN'));

// ── User CRUD ─────────────────────────────────────────────────────────────────
router.post(
  '/',
  validate(createUserSchema),
  userAccessController.createUser
);

router.get('/', userAccessController.getAllUsers);

router.get('/:id', userAccessController.getUserById);

router.patch(
  '/:id',
  validate(updateUserSchema),
  userAccessController.updateUser
);

router.delete('/:id', userAccessController.deleteUser);

router.patch(
  '/:id/reset-password',
  validate(resetPasswordSchema),
  userAccessController.resetUserPassword
);

// ── Property Access ───────────────────────────────────────────────────────────
router.get(
  '/:id/property-access',
  userAccessController.getUserPropertyAccess
);

router.post(
  '/:id/property-access',
  validate(assignPropertyAccessSchema),
  userAccessController.assignPropertyAccess
);

router.patch(
  '/property-access/:accessId',
  validate(updatePropertyAccessSchema),
  userAccessController.updatePropertyAccess
);

router.delete(
  '/property-access/:accessId',
  userAccessController.revokePropertyAccess
);

module.exports = router;