const paymentService = require('./payment.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Record Rent Payment ───────────────────────────────────────────────────────

const recordPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.recordPayment(
    req.params.ledgerId,
    req.body,
    req.file
  );
  sendSuccess(res, 201, 'Payment recorded successfully.', payment);
});

// ── Record Advance Payment ────────────────────────────────────────────────────

const recordAdvancePayment = catchAsync(async (req, res) => {
  const payment = await paymentService.recordAdvancePayment(
    req.params.agreementId,
    req.body,
    req.file
  );
  sendSuccess(res, 201, 'Advance payment recorded successfully.', payment);
});

// ── Get All Payments ──────────────────────────────────────────────────────────

const getAllPayments = catchAsync(async (req, res) => {
  const { payments, meta } = await paymentService.getAllPayments(req.query, req.user);
  sendSuccess(res, 200, 'Payments fetched successfully.', payments, meta);
});

// ── Get Payment By ID ─────────────────────────────────────────────────────────

const getPaymentById = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);
  sendSuccess(res, 200, 'Payment fetched successfully.', payment);
});

// ── Get Payments By Ledger ────────────────────────────────────────────────────

const getPaymentsByLedger = catchAsync(async (req, res) => {
  const ledger = await paymentService.getPaymentsByLedger(req.params.ledgerId);
  sendSuccess(res, 200, 'Ledger payments fetched successfully.', ledger);
});

// ── Get All Ledgers ───────────────────────────────────────────────────────────

const getAllLedgers = catchAsync(async (req, res) => {
  const { ledgers, meta } = await paymentService.getAllLedgers(req.query, req.user);
  sendSuccess(res, 200, 'Ledgers fetched successfully.', ledgers, meta);
});

// ── Get Ledger By ID ──────────────────────────────────────────────────────────

const getLedgerById = catchAsync(async (req, res) => {
  const ledger = await paymentService.getLedgerById(req.params.id);
  sendSuccess(res, 200, 'Ledger fetched successfully.', ledger);
});

module.exports = {
  recordPayment,
  recordAdvancePayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByLedger,
  getAllLedgers,
  getLedgerById,
};