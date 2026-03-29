const reportsService = require('./reports.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Portfolio Summary ─────────────────────────────────────────────────────────

const getPortfolioSummary = catchAsync(async (req, res) => {
  const data = await reportsService.getPortfolioSummary(req.user);
  sendSuccess(res, 200, 'Portfolio summary fetched successfully.', data);
});

// ── Property Report ───────────────────────────────────────────────────────────

const getPropertyReport = catchAsync(async (req, res) => {
  const data = await reportsService.getPropertyReport(req.params.propertyId, req.user);
  sendSuccess(res, 200, 'Property report fetched successfully.', data);
});

// ── Monthly Report ────────────────────────────────────────────────────────────

const getMonthlyReport = catchAsync(async (req, res) => {
  const data = await reportsService.getMonthlyReport(req.query, req.user);
  sendSuccess(res, 200, 'Monthly report fetched successfully.', data);
});

// ── Yearly Report ─────────────────────────────────────────────────────────────

const getYearlyReport = catchAsync(async (req, res) => {
  const data = await reportsService.getYearlyReport(req.query, req.user);
  sendSuccess(res, 200, 'Yearly report fetched successfully.', data);
});

// ── Lifetime Report ───────────────────────────────────────────────────────────

const getLifetimeReport = catchAsync(async (req, res) => {
  const data = await reportsService.getLifetimeReport(req.user);
  sendSuccess(res, 200, 'Lifetime report fetched successfully.', data);
});

// ── Tenant Report ─────────────────────────────────────────────────────────────

const getTenantReport = catchAsync(async (req, res) => {
  const data = await reportsService.getTenantReport(req.params.tenantId, req.user);
  sendSuccess(res, 200, 'Tenant report fetched successfully.', data);
});

// ── Expiring Soon Report ──────────────────────────────────────────────────────

const getExpiringSoonReport = catchAsync(async (req, res) => {
  const data = await reportsService.getExpiringSoonReport(req.query, req.user);
  sendSuccess(res, 200, 'Expiring agreements fetched successfully.', data);
});

// ── Overdue Report ────────────────────────────────────────────────────────────

const getOverdueReport = catchAsync(async (req, res) => {
  const data = await reportsService.getOverdueReport(req.query, req.user);
  sendSuccess(res, 200, 'Overdue report fetched successfully.', data);
});

// ── Property Revenue Summary ──────────────────────────────────────────────────

const getPropertyRevenueSummary = catchAsync(async (req, res) => {
  const data = await reportsService.getPropertyRevenueSummary(req.query, req.user);
  sendSuccess(res, 200, 'Property revenue summary fetched successfully.', data);
});

module.exports = {
  getPortfolioSummary,
  getPropertyReport,
  getMonthlyReport,
  getYearlyReport,
  getLifetimeReport,
  getTenantReport,
  getExpiringSoonReport,
  getOverdueReport,
  getPropertyRevenueSummary,
};