const express = require('express');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Raut Rentals API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Module routes will be mounted here as they are built ──
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/userAccess/userAccess.routes'));
router.use('/property-types', require('../modules/propertyType/propertyType.routes'));
router.use('/properties', require('../modules/property/property.routes'));
router.use('/tenants', require('../modules/tenant/tenant.routes'));
router.use('/brokers', require('../modules/broker/broker.routes'));
router.use('/agreements', require('../modules/agreement/agreement.routes'));
router.use('/payments', require('../modules/payment/payment.routes'));
router.use('/dashboard',     require('../modules/dashboard/dashboard.routes'));
router.use('/reports', require('../modules/reports/reports.routes'));

module.exports = router;
