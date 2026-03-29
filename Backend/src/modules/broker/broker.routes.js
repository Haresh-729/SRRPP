const express = require('express');
const router = express.Router();

const brokerController = require('./broker.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { createBrokerSchema, updateBrokerSchema } = require('../../validators/broker.validator');

router.use(authenticate);

// ── Admin + User ──────────────────────────────────────────────────────────────
router.get('/summary', brokerController.getBrokerSummary);
router.get('/',        brokerController.getAllBrokers);
router.get('/:id',     brokerController.getBrokerById);

// ── Admin Only ────────────────────────────────────────────────────────────────
router.post(
  '/',
  authorize('ADMIN'),
  validate(createBrokerSchema),
  brokerController.createBroker
);

router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updateBrokerSchema),
  brokerController.updateBroker
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  brokerController.deleteBroker
);

module.exports = router;