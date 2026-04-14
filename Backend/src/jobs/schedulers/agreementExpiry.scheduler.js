const cron = require('node-cron');
const { prisma } = require('../../config/database');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const emailService = require('../../modules/notifications/email.service');

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const runAgreementExpiryJob = async () => {
	const today = startOfDay(new Date());
	const target = new Date(today);
	target.setDate(target.getDate() + constants.AGREEMENT_EXPIRY_REMINDER_DAYS);
	const next = new Date(target);
	next.setDate(next.getDate() + 1);

	const agreements = await prisma.agreements.findMany({
		where: {
			status: 'ACTIVE',
			end_date: { gte: target, lt: next },
			tenants: { email: { not: null } },
		},
		include: {
			tenants: { select: { id: true, full_name: true, email: true } },
			properties: { select: { id: true, name: true } },
		},
	});

	for (const agreement of agreements) {
		try {
			const existing = await prisma.notification_logs.findFirst({
				where: {
					type: 'AGREEMENT_EXPIRY_30DAY',
					channel: 'EMAIL',
					agreement_id: agreement.id,
					reference_month: agreement.end_date.toISOString().slice(0, 7),
					status: 'SENT',
				},
			});
			if (existing) continue;

			await emailService.sendAgreementExpiryEmail({
				to: agreement.tenants.email,
				tenantName: agreement.tenants.full_name,
				propertyName: agreement.properties.name,
				endDate: agreement.end_date,
			});

			await prisma.notification_logs.create({
				data: {
					type: 'AGREEMENT_EXPIRY_30DAY',
					channel: 'EMAIL',
					agreement_id: agreement.id,
					tenant_id: agreement.tenant_id,
					property_id: agreement.property_id,
					reference_month: agreement.end_date.toISOString().slice(0, 7),
					status: 'SENT',
					sent_at: new Date(),
				},
			});
		} catch (error) {
			logger.error(`Agreement expiry reminder failed for agreement ${agreement.id}: ${error.message}`);
			await prisma.notification_logs.create({
				data: {
					type: 'AGREEMENT_EXPIRY_30DAY',
					channel: 'EMAIL',
					agreement_id: agreement.id,
					tenant_id: agreement.tenant_id,
					property_id: agreement.property_id,
					reference_month: agreement.end_date.toISOString().slice(0, 7),
					status: 'FAILED',
					failure_reason: error.message,
				},
			}).catch(() => {});
		}
	}
};

const startAgreementExpiryScheduler = () => {
	cron.schedule('10 9 * * *', async () => {
		logger.info('Running agreement expiry scheduler...');
		await runAgreementExpiryJob();
	}, { timezone: 'Asia/Kolkata' });
};

module.exports = { startAgreementExpiryScheduler, runAgreementExpiryJob };
