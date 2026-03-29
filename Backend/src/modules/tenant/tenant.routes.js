const express = require('express');
const router = express.Router();

const tenantController = require('./tenant.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { tenantDocUpload } = require('../../config/multer');
const { createTenantSchema, updateTenantSchema } = require('../../validators/tenant.validator');

router.use(authenticate);

// ── Admin + User ──────────────────────────────────────────────────────────────
router.get('/summary', tenantController.getTenantSummary);
router.get('/',        tenantController.getAllTenants);
router.get('/:id',     tenantController.getTenantById);

// ── Admin Only ────────────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('ADMIN', 'USER'),
  tenantDocUpload.fields([
    { name: 'aadharPhoto', maxCount: 1 },
    { name: 'panPhoto',    maxCount: 1 },
  ]),
  validate(createTenantSchema),
  tenantController.createTenant
);

router.patch(
  '/:id',
  authorize('ADMIN', 'USER'),
  tenantDocUpload.fields([
    { name: 'aadharPhoto', maxCount: 1 },
    { name: 'panPhoto',    maxCount: 1 },
  ]),
  validate(updateTenantSchema),
  tenantController.updateTenant
);

router.delete(
  '/:id/documents/:docType',
  authorize('ADMIN'),
  tenantController.deleteTenantDocument
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  tenantController.deleteTenant
);

module.exports = router;