const express = require('express');
const router = express.Router();

const propertyTypeController = require('./propertyType.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  createPropertyTypeSchema,
  updatePropertyTypeSchema,
} = require('../../validators/propertyType.validator');

router.use(authenticate);

// ── Admin only ────────────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('ADMIN'),
  validate(createPropertyTypeSchema),
  propertyTypeController.createPropertyType
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updatePropertyTypeSchema),
  propertyTypeController.updatePropertyType
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  propertyTypeController.deletePropertyType
);

// ── Admin + User ──────────────────────────────────────────────────────────────
router.get('/',        propertyTypeController.getAllPropertyTypes);
router.get('/active',  propertyTypeController.getActivePropertyTypes);
router.get('/:id',     propertyTypeController.getPropertyTypeById);
router.get('/byid/:id',     propertyTypeController.getPropertyTypeById);

module.exports = router;