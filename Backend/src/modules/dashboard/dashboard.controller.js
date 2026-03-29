const dashboardService = require('./dashboard.service');
const catchAsync = require('../../utils/catchAsync');
const { sendSuccess } = require('../../utils/apiResponse');

const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user);
  sendSuccess(res, 200, 'Dashboard fetched successfully.', data);
});

module.exports = { getDashboard };