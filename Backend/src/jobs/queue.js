const logger = require('../config/logger');
const { startRentReminderScheduler } = require('./schedulers/rentReminder.scheduler');
const { startRentDueScheduler } = require('./schedulers/rentDue.scheduler');
const { startAgreementExpiryScheduler } = require('./schedulers/agreementExpiry.scheduler');

const startSchedulers = () => {
	startRentReminderScheduler();
	startRentDueScheduler();
	startAgreementExpiryScheduler();
	logger.info('✅ Notification schedulers started.');
};

module.exports = { startSchedulers };
