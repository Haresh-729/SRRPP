const express = require('express');
const router = express.Router();

const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', dashboardController.getDashboard);

module.exports = router;