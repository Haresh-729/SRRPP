const agreementService = require('./agreement.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create Agreement ──────────────────────────────────────────────────────────

const createAgreement = catchAsync(async (req, res) => {
  const agreement = await agreementService.createAgreement(req.body, req.files);
  sendSuccess(res, 201, 'Agreement created successfully.', agreement);
});

// ── Get All Agreements ────────────────────────────────────────────────────────

const getAllAgreements = catchAsync(async (req, res) => {
  const { agreements, meta } = await agreementService.getAllAgreements(req.query, req.user);
  sendSuccess(res, 200, 'Agreements fetched successfully.', agreements, meta);
});

// ── Get Agreement By ID ───────────────────────────────────────────────────────

const getAgreementById = catchAsync(async (req, res) => {
  const agreement = await agreementService.getAgreementById(req.params.id, req.user);
  sendSuccess(res, 200, 'Agreement fetched successfully.', agreement);
});

// ── Update Agreement PDF ──────────────────────────────────────────────────────

const updateAgreementPdf = catchAsync(async (req, res) => {
  const agreement = await agreementService.updateAgreementPdf(req.params.id, req.file);
  sendSuccess(res, 200, 'Agreement PDF updated successfully.', agreement);
});

// ── Terminate Agreement ───────────────────────────────────────────────────────

const terminateAgreement = catchAsync(async (req, res) => {
  const agreement = await agreementService.terminateAgreement(req.params.id, req.body);
  sendSuccess(res, 200, 'Agreement terminated successfully.', agreement);
});

// ── Update Deposit Payment ────────────────────────────────────────────────────

const updateDepositPayment = catchAsync(async (req, res) => {
  const deposit = await agreementService.updateDepositPayment(
    req.params.id,
    req.body,
    req.file
  );
  sendSuccess(res, 200, 'Deposit payment updated successfully.', deposit);
});

// ── Update Brokerage Payment ──────────────────────────────────────────────────

const updateBrokeragePayment = catchAsync(async (req, res) => {
  const brokerage = await agreementService.updateBrokeragePayment(
    req.params.id,
    req.body,
    req.file
  );
  sendSuccess(res, 200, 'Brokerage payment updated successfully.', brokerage);
});

// ── Get Agreement Ledgers ─────────────────────────────────────────────────────

const getAgreementLedgers = catchAsync(async (req, res) => {
  const ledgers = await agreementService.getAgreementLedgers(req.params.id, req.user);
  sendSuccess(res, 200, 'Agreement ledgers fetched successfully.', ledgers);
});

module.exports = {
  createAgreement,
  getAllAgreements,
  getAgreementById,
  updateAgreementPdf,
  terminateAgreement,
  updateDepositPayment,
  updateBrokeragePayment,
  getAgreementLedgers,
};