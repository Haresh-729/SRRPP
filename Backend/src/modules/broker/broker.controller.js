const brokerService = require('./broker.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create Broker ─────────────────────────────────────────────────────────────

const createBroker = catchAsync(async (req, res) => {
  const broker = await brokerService.createBroker(req.body);
  sendSuccess(res, 201, 'Broker created successfully.', broker);
});

// ── Get All Brokers ───────────────────────────────────────────────────────────

const getAllBrokers = catchAsync(async (req, res) => {
  const { brokers, meta } = await brokerService.getAllBrokers(req.query);
  sendSuccess(res, 200, 'Brokers fetched successfully.', brokers, meta);
});

// ── Get Broker Summary ────────────────────────────────────────────────────────

const getBrokerSummary = catchAsync(async (_req, res) => {
  const brokers = await brokerService.getBrokerSummary();
  sendSuccess(res, 200, 'Broker summary fetched successfully.', brokers);
});

// ── Get Broker By ID ──────────────────────────────────────────────────────────

const getBrokerById = catchAsync(async (req, res) => {
  const broker = await brokerService.getBrokerById(req.params.id);
  sendSuccess(res, 200, 'Broker fetched successfully.', broker);
});

// ── Update Broker ─────────────────────────────────────────────────────────────

const updateBroker = catchAsync(async (req, res) => {
  const broker = await brokerService.updateBroker(req.params.id, req.body);
  sendSuccess(res, 200, 'Broker updated successfully.', broker);
});

// ── Delete Broker ─────────────────────────────────────────────────────────────

const deleteBroker = catchAsync(async (req, res) => {
  await brokerService.deleteBroker(req.params.id);
  sendSuccess(res, 200, 'Broker deleted successfully.');
});

module.exports = {
  createBroker,
  getAllBrokers,
  getBrokerSummary,
  getBrokerById,
  updateBroker,
  deleteBroker,
};