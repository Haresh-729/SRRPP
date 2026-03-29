const authService = require('./auth.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

// ── Login ────────────────────────────────────────────────────────────────────

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  sendSuccess(res, 200, 'Login successful.', { user, accessToken, refreshToken });
});

// ── Refresh Token ────────────────────────────────────────────────────────────

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshToken(token);

  sendSuccess(res, 200, 'Token refreshed successfully.', result);
});

// ── Get Me ───────────────────────────────────────────────────────────────────

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user.id);

  sendSuccess(res, 200, 'User profile fetched successfully.', user);
});

// ── Change Password ──────────────────────────────────────────────────────────

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);

  sendSuccess(res, 200, 'Password changed successfully.');
});

// ── Logout ───────────────────────────────────────────────────────────────────

const logout = catchAsync(async (_req, res) => {
  // Since we are stateless (JWT), logout is handled on the client side
  // by discarding the tokens. This endpoint serves as a clean contract.
  sendSuccess(res, 200, 'Logged out successfully.');
});

module.exports = { login, refreshToken, getMe, changePassword, logout };