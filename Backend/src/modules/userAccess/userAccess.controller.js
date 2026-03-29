const userAccessService = require('./userAccess.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Create User ───────────────────────────────────────────────────────────────

const createUser = catchAsync(async (req, res) => {
  const user = await userAccessService.createUser(req.body);
  sendSuccess(res, 201, 'User created successfully.', user);
});

// ── Get All Users ─────────────────────────────────────────────────────────────

const getAllUsers = catchAsync(async (req, res) => {
  const { users, meta } = await userAccessService.getAllUsers(req.query);
  sendSuccess(res, 200, 'Users fetched successfully.', users, meta);
});

// ── Get User By ID ────────────────────────────────────────────────────────────

const getUserById = catchAsync(async (req, res) => {
  const user = await userAccessService.getUserById(req.params.id);
  sendSuccess(res, 200, 'User fetched successfully.', user);
});

// ── Update User ───────────────────────────────────────────────────────────────

const updateUser = catchAsync(async (req, res) => {
  const user = await userAccessService.updateUser(req.params.id, req.body);
  sendSuccess(res, 200, 'User updated successfully.', user);
});

// ── Reset User Password ───────────────────────────────────────────────────────

const resetUserPassword = catchAsync(async (req, res) => {
  await userAccessService.resetUserPassword(req.params.id, req.body.newPassword);
  sendSuccess(res, 200, 'User password reset successfully.');
});

// ── Assign Property Access ────────────────────────────────────────────────────

const assignPropertyAccess = catchAsync(async (req, res) => {
  const access = await userAccessService.assignPropertyAccess(req.params.id, req.body);
  sendSuccess(res, 201, 'Property access assigned successfully.', access);
});

// ── Update Property Access ────────────────────────────────────────────────────

const updatePropertyAccess = catchAsync(async (req, res) => {
  const access = await userAccessService.updatePropertyAccess(req.params.accessId, req.body);
  sendSuccess(res, 200, 'Property access updated successfully.', access);
});

// ── Revoke Property Access ────────────────────────────────────────────────────

const revokePropertyAccess = catchAsync(async (req, res) => {
  await userAccessService.revokePropertyAccess(req.params.accessId);
  sendSuccess(res, 200, 'Property access revoked successfully.');
});

// ── Get All Access For A User ─────────────────────────────────────────────────

const getUserPropertyAccess = catchAsync(async (req, res) => {
  const access = await userAccessService.getUserPropertyAccess(req.params.id);
  sendSuccess(res, 200, 'User property access fetched successfully.', access);
});

// ── Delete User ───────────────────────────────────────────────────────────────

const deleteUser = catchAsync(async (req, res) => {
  await userAccessService.deleteUser(req.params.id);
  sendSuccess(res, 200, 'User deactivated successfully.');
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  assignPropertyAccess,
  updatePropertyAccess,
  revokePropertyAccess,
  getUserPropertyAccess,
  deleteUser,
};