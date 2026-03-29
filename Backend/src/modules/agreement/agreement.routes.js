const express = require('express');
const router = express.Router();

const agreementController = require('./agreement.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { agreementCreationUpload, agreementUpload, chequeUpload } = require('../../config/multer');
const {
  createAgreementSchema,
  terminateAgreementSchema,
  updateDepositSchema,
  updateBrokerageSchema,
} = require('../../validators/agreement.validator');

router.use(authenticate);

// ── Admin + User ──────────────────────────────────────────────────────────────
router.get('/',        agreementController.getAllAgreements);
router.get('/:id',     agreementController.getAgreementById);
router.get('/:id/ledgers', agreementController.getAgreementLedgers);

// ── Admin Only ────────────────────────────────────────────────────────────────

// Create Agreement — multipart: agreementPdf, depositChequePhoto, brokerageChequePhoto
router.post(
  '/',
  authorize('ADMIN', 'USER'),
  agreementCreationUpload.fields([
    { name: 'agreementPdf',        maxCount: 1 },
    { name: 'depositChequePhoto',  maxCount: 1 },
    { name: 'brokerageChequePhoto', maxCount: 1 },
  ]),
  validate(createAgreementSchema),
  agreementController.createAgreement
);

// Update Agreement PDF only
router.patch(
  '/:id/pdf',
  authorize('ADMIN'),
  agreementUpload.single('agreementPdf'),
  agreementController.updateAgreementPdf
);

// Terminate Agreement
router.patch(
  '/:id/terminate',
  authorize('ADMIN'),
  validate(terminateAgreementSchema),
  agreementController.terminateAgreement
);

// Update Deposit Payment — multipart: chequePhoto
router.put(
  '/:id/deposit',
  authorize('ADMIN'),
  chequeUpload.single('chequePhoto'),
  validate(updateDepositSchema),
  agreementController.updateDepositPayment
);

// Update Brokerage Payment — multipart: chequePhoto
router.put(
  '/:id/brokerage',
  authorize('ADMIN'),
  chequeUpload.single('chequePhoto'),
  validate(updateBrokerageSchema),
  agreementController.updateBrokeragePayment
);

module.exports = router;