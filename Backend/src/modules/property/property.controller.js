const propertyService = require('./property.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create Property ───────────────────────────────────────────────────────────

const createProperty = catchAsync(async (req, res) => {
  const property = await propertyService.createProperty(req.body, req.file);
  sendSuccess(res, 201, 'Property created successfully.', property);
});

// ── Get All Properties ────────────────────────────────────────────────────────

const getAllProperties = catchAsync(async (req, res) => {
  const { properties, meta } = await propertyService.getAllProperties(req.query, req.user);
  sendSuccess(res, 200, 'Properties fetched successfully.', properties, meta);
});

// ── Get Property Summary ──────────────────────────────────────────────────────

const getPropertySummary = catchAsync(async (req, res) => {
  const properties = await propertyService.getPropertySummary(req.user);
  sendSuccess(res, 200, 'Property summary fetched successfully.', properties);
});

// ── Get Property By ID ────────────────────────────────────────────────────────

const getPropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(req.params.id, req.user);
  sendSuccess(res, 200, 'Property fetched successfully.', property);
});

// ── Update Property ───────────────────────────────────────────────────────────

const updateProperty = catchAsync(async (req, res) => {
  const property = await propertyService.updateProperty(req.params.id, req.body, req.file);
  sendSuccess(res, 200, 'Property updated successfully.', property);
});

// ── Delete Purchase Agreement PDF ─────────────────────────────────────────────

const deletePurchaseAgreementPdf = catchAsync(async (req, res) => {
  await propertyService.deletePurchaseAgreementPdf(req.params.id);
  sendSuccess(res, 200, 'Purchase agreement PDF deleted successfully.');
});

// ── Delete Property ───────────────────────────────────────────────────────────

const deleteProperty = catchAsync(async (req, res) => {
  await propertyService.deleteProperty(req.params.id);
  sendSuccess(res, 200, 'Property deleted successfully.');
});

module.exports = {
  createProperty,
  getAllProperties,
  getPropertySummary,
  getPropertyById,
  updateProperty,
  deletePurchaseAgreementPdf,
  deleteProperty,
};