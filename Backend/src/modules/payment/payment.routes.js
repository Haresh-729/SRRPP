const express = require('express');
const router = express.Router();

const paymentController = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { chequeUpload } = require('../../config/multer');
const {
  recordPaymentSchema,
  recordAdvancePaymentSchema,
} = require('../../validators/payment.validator');

router.use(authenticate);

// ── Ledger Routes ─────────────────────────────────────────────────────────────
router.get('/ledgers',                     paymentController.getAllLedgers);
router.get('/ledgers/:id',                 paymentController.getLedgerById);
router.get('/ledgers/:ledgerId/payments',  paymentController.getPaymentsByLedger);

// ── Payment Routes ────────────────────────────────────────────────────────────
router.get('/',     paymentController.getAllPayments);
router.get('/:id',  paymentController.getPaymentById);

// ── Record Payment (Admin + User) ─────────────────────────────────────────────
router.post(
  '/ledgers/:ledgerId/record',
  authorize('ADMIN', 'USER'),
  chequeUpload.single('chequePhoto'),
  validate(recordPaymentSchema),
  paymentController.recordPayment
);

// ── Record Advance Payment (Admin + User) ─────────────────────────────────────
router.post(
  '/agreements/:agreementId/advance',
  authorize('ADMIN', 'USER'),
  chequeUpload.single('chequePhoto'),
  validate(recordAdvancePaymentSchema),
  paymentController.recordAdvancePayment
);

module.exports = router;