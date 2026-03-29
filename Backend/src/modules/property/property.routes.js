const express = require('express');
const router = express.Router();

const propertyController = require('./property.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { purchaseAgreementUpload } = require('../../config/multer');
const {
  createPropertySchema,
  updatePropertySchema,
} = require('../../validators/property.validator');

router.use(authenticate);

// ── Admin + User ──────────────────────────────────────────────────────────────
router.get('/summary', propertyController.getPropertySummary);
router.get('/',        propertyController.getAllProperties);
router.get('/:id',     propertyController.getPropertyById);

// ── Admin Only ────────────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('ADMIN'),
  purchaseAgreementUpload.single('purchaseAgreementPdf'),
  validate(createPropertySchema),
  propertyController.createProperty
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  purchaseAgreementUpload.single('purchaseAgreementPdf'),
  validate(updatePropertySchema),
  propertyController.updateProperty
);

router.delete(
  '/:id/purchase-agreement-pdf',
  authorize('ADMIN'),
  propertyController.deletePurchaseAgreementPdf
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  propertyController.deleteProperty
);

module.exports = router;