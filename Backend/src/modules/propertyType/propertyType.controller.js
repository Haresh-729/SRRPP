const propertyTypeService = require('./propertyType.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create ───────────────────────────────────────────────────────────────────

const createPropertyType = catchAsync(async (req, res) => {
  const propertyType = await propertyTypeService.createPropertyType(req.body);
  sendSuccess(res, 201, 'Property type created successfully.', propertyType);
});

// ── Get All ──────────────────────────────────────────────────────────────────

const getAllPropertyTypes = catchAsync(async (req, res) => {
  const { propertyTypes, meta } = await propertyTypeService.getAllPropertyTypes(req.query);
  sendSuccess(res, 200, 'Property types fetched successfully.', propertyTypes, meta);
});

// ── Get All Active ───────────────────────────────────────────────────────────

const getActivePropertyTypes = catchAsync(async (_req, res) => {
  const propertyTypes = await propertyTypeService.getActivePropertyTypes();
  sendSuccess(res, 200, 'Active property types fetched successfully.', propertyTypes);
});

// ── Get By ID ────────────────────────────────────────────────────────────────

const getPropertyTypeById = catchAsync(async (req, res) => {
  const propertyType = await propertyTypeService.getPropertyTypeById(req.params.id);
  sendSuccess(res, 200, 'Property type fetched successfully.', propertyType);
});

// ── Update ───────────────────────────────────────────────────────────────────

const updatePropertyType = catchAsync(async (req, res) => {
  const propertyType = await propertyTypeService.updatePropertyType(req.params.id, req.body);
  sendSuccess(res, 200, 'Property type updated successfully.', propertyType);
});

// ── Delete ───────────────────────────────────────────────────────────────────

const deletePropertyType = catchAsync(async (req, res) => {
  await propertyTypeService.deletePropertyType(req.params.id);
  sendSuccess(res, 200, 'Property type deleted successfully.');
});

module.exports = {
  createPropertyType,
  getAllPropertyTypes,
  getActivePropertyTypes,
  getPropertyTypeById,
  updatePropertyType,
  deletePropertyType,
};