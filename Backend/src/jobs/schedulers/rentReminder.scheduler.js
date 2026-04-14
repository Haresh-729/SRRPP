const cron = require('node-cron');
const { prisma } = require('../../config/database');
const logger = require('../../config/logger');
const constants = require('../../config/constants');
const emailService = require('../../modules/notifications/email.service');

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const runRentReminderJob = async () => {
	const today = startOfDay(new Date());
	const target = new Date(today);
	target.setDate(target.getDate() + constants.RENT_REMINDER_DAYS_BEFORE);
	const next = new Date(target);
	next.setDate(next.getDate() + 1);

	const ledgers = await prisma.rent_ledgers.findMany({
		where: {
			due_date: { gte: target, lt: next },
			status: { in: ['PENDING', 'PARTIAL'] },
			agreements: { status: 'ACTIVE' },
			tenants: { email: { not: null } },
		},
		include: {
			agreements: { select: { id: true } },
			tenants: { select: { id: true, full_name: true, email: true } },
			properties: { select: { id: true, name: true } },
		},
	});

	for (const ledger of ledgers) {
		try {
			const existing = await prisma.notification_logs.findFirst({
				where: {
					type: 'RENT_REMINDER_5DAY',
					channel: 'EMAIL',
					agreement_id: ledger.agreement_id,
					reference_month: ledger.ledger_month,
					status: 'SENT',
				},
			});
			if (existing) continue;

			await emailService.sendRentReminderEmail({
				to: ledger.tenants.email,
				tenantName: ledger.tenants.full_name,
				propertyName: ledger.properties.name,
				ledgerMonth: ledger.ledger_month,
				dueDate: ledger.due_date,
				rentAmount: ledger.rent_amount,
				gstAmount: ledger.gst_amount,
				totalDue: ledger.total_due,
			});

			await prisma.notification_logs.create({
				data: {
					type: 'RENT_REMINDER_5DAY',
					channel: 'EMAIL',
					agreement_id: ledger.agreement_id,
					tenant_id: ledger.tenant_id,
					property_id: ledger.property_id,
					ledger_id: ledger.id,
					reference_month: ledger.ledger_month,
					status: 'SENT',
					sent_at: new Date(),
				},
			});
		} catch (error) {
			logger.error(`Rent reminder failed for ledger ${ledger.id}: ${error.message}`);
			await prisma.notification_logs.create({
				data: {
					type: 'RENT_REMINDER_5DAY',
					channel: 'EMAIL',
					agreement_id: ledger.agreement_id,
					tenant_id: ledger.tenant_id,
					property_id: ledger.property_id,
					ledger_id: ledger.id,
					reference_month: ledger.ledger_month,
					status: 'FAILED',
					failure_reason: error.message,
				},
			}).catch(() => {});
		}
	}
};

const startRentReminderScheduler = () => {
	cron.schedule('0 9 * * *', async () => {
		logger.info('Running rent reminder scheduler...');
		await runRentReminderJob();
	}, { timezone: 'Asia/Kolkata' });
};

module.exports = { startRentReminderScheduler, runRentReminderJob };
