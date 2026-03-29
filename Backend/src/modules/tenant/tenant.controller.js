const tenantService = require('./tenant.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create Tenant ─────────────────────────────────────────────────────────────

const createTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body, req.files);
  sendSuccess(res, 201, 'Tenant created successfully.', tenant);
});

// ── Get All Tenants ───────────────────────────────────────────────────────────

const getAllTenants = catchAsync(async (req, res) => {
  const { tenants, meta } = await tenantService.getAllTenants(req.query);
  sendSuccess(res, 200, 'Tenants fetched successfully.', tenants, meta);
});

// ── Get Tenant Summary ────────────────────────────────────────────────────────

const getTenantSummary = catchAsync(async (_req, res) => {
  const tenants = await tenantService.getTenantSummary();
  sendSuccess(res, 200, 'Tenant summary fetched successfully.', tenants);
});

// ── Get Tenant By ID ──────────────────────────────────────────────────────────

const getTenantById = catchAsync(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  sendSuccess(res, 200, 'Tenant fetched successfully.', tenant);
});

// ── Update Tenant ─────────────────────────────────────────────────────────────

const updateTenant = catchAsync(async (req, res) => {
  const tenant = await tenantService.updateTenant(req.params.id, req.body, req.files);
  sendSuccess(res, 200, 'Tenant updated successfully.', tenant);
});

// ── Delete Tenant Document ────────────────────────────────────────────────────

const deleteTenantDocument = catchAsync(async (req, res) => {
  await tenantService.deleteTenantDocument(req.params.id, req.params.docType);
  sendSuccess(res, 200, `Tenant ${req.params.docType} document deleted successfully.`);
});

// ── Delete Tenant ─────────────────────────────────────────────────────────────

const deleteTenant = catchAsync(async (req, res) => {
  await tenantService.deleteTenant(req.params.id);
  sendSuccess(res, 200, 'Tenant deactivated successfully.');
});

module.exports = {
  createTenant,
  getAllTenants,
  getTenantSummary,
  getTenantById,
  updateTenant,
  deleteTenantDocument,
  deleteTenant,
};