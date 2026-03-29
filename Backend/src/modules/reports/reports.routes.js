const express = require('express');
const router = express.Router();

const reportsController = require('./reports.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/portfolio', reportsController.getPortfolioSummary);
router.get('/monthly', reportsController.getMonthlyReport);
router.get('/yearly', reportsController.getYearlyReport);
router.get('/lifetime', reportsController.getLifetimeReport);
router.get('/expiring-soon', reportsController.getExpiringSoonReport);
router.get('/overdue', reportsController.getOverdueReport);
router.get('/property-revenue', reportsController.getPropertyRevenueSummary);
router.get('/property/:propertyId', reportsController.getPropertyReport);
router.get('/tenant/:tenantId', reportsController.getTenantReport);

module.exports = router;
