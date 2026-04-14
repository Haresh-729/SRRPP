const { transporter } = require('../../config/nodemailer');
const env = require('../../config/env');
const logger = require('../../config/logger');
const { buildRentReminderTemplate } = require('./templates/rentReminder.template');
const { buildRentDueTemplate } = require('./templates/rentDue.template');
const { buildAgreementExpiryTemplate } = require('./templates/agreementExpiry.template');

const renderCard = ({ title, subtitle, body }) => `
	<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:14px;max-width:640px;margin:0 auto;font-family:Montserrat,Arial,sans-serif;color:#0f2419;overflow:hidden;">
		<div style="background:linear-gradient(135deg,#1a6b3c,#26784a);padding:18px 22px;">
			<h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;">${title}</h1>
			<p style="margin:6px 0 0;font-size:13px;color:#e6f4ec;">${subtitle}</p>
		</div>
		<div style="padding:18px 22px;background:#f4f7f5;">${body}</div>
	</div>
`;

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (iso) => {
	if (!iso) return 'N/A';
	return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const sendEmail = async ({ to, subject, html, text }) => {
	if (!to) throw new Error('Recipient email is required.');

	const from = env.MAIL_FROM || env.MAIL_USER;
	const info = await transporter.sendMail({ from, to, subject, html, text });
	logger.info(`Email sent: ${subject}`, { to, messageId: info.messageId });
	return info;
};

const sendAgreementCreatedEmail = async ({
	to,
	tenantName,
	propertyName,
	startDate,
	endDate,
	durationMonths,
	monthlyRent,
	depositAmount,
	rentDueDay,
	gstApplicable,
	gstPercent,
	gstBillingType,
	gstIsInclusive,
}) => {
	const subject = `Agreement Created: ${propertyName}`;
	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">Hi ${tenantName}, your agreement has been successfully created.</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Property: <strong style="color:#0f2419;">${propertyName}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Duration: <strong style="color:#0f2419;">${durationMonths} months</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Start Date: <strong style="color:#0f2419;">${formatDate(startDate)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">End Date: <strong style="color:#0f2419;">${formatDate(endDate)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Monthly Rent: <strong style="color:#0f2419;">${formatCurrency(monthlyRent)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Deposit: <strong style="color:#0f2419;">${formatCurrency(depositAmount)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Rent Due Day: <strong style="color:#0f2419;">${rentDueDay}th</strong></p>
			<p style="margin:0;font-size:13px;color:#4a7560;">GST: <strong style="color:#0f2419;">${gstApplicable ? `${Number(gstPercent || 0).toFixed(2)}% (${gstBillingType || 'EVERY_MONTH'}, ${gstIsInclusive ? 'Inclusive' : 'Exclusive'})` : 'Not Applicable'}</strong></p>
		</div>
	`;

	const html = renderCard({
		title: 'Agreement Confirmed',
		subtitle: 'Raut Rentals',
		body,
	});

	const text = [
		`Hi ${tenantName},`,
		`Your agreement for ${propertyName} has been created.`,
		`Duration: ${durationMonths} months`,
		`Start Date: ${formatDate(startDate)}`,
		`End Date: ${formatDate(endDate)}`,
		`Monthly Rent: ${formatCurrency(monthlyRent)}`,
		`Deposit: ${formatCurrency(depositAmount)}`,
		`Rent Due Day: ${rentDueDay}th`,
		gstApplicable ? `GST: ${Number(gstPercent || 0).toFixed(2)}% (${gstBillingType || 'EVERY_MONTH'}, ${gstIsInclusive ? 'Inclusive' : 'Exclusive'})` : 'GST: Not Applicable',
	].join('\n');

	return sendEmail({ to, subject, html, text });
};

const sendAgreementTerminatedEmail = async ({
	to,
	tenantName,
	propertyName,
	terminatedAt,
	terminationReason,
}) => {
	const subject = `Agreement Terminated: ${propertyName}`;
	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">Hi ${tenantName}, your agreement has been marked as terminated.</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Property: <strong style="color:#0f2419;">${propertyName}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Terminated At: <strong style="color:#0f2419;">${formatDate(terminatedAt)}</strong></p>
			<p style="margin:0;font-size:13px;color:#4a7560;">Reason: <strong style="color:#0f2419;">${terminationReason || 'N/A'}</strong></p>
		</div>
	`;

	const html = renderCard({
		title: 'Agreement Terminated',
		subtitle: 'Raut Rentals',
		body,
	});

	const text = [
		`Hi ${tenantName},`,
		`Your agreement for ${propertyName} has been terminated.`,
		`Terminated At: ${formatDate(terminatedAt)}`,
		`Reason: ${terminationReason || 'N/A'}`,
	].join('\n');

	return sendEmail({ to, subject, html, text });
};

const sendTenantWelcomeEmail = async ({
	to,
	tenantName,
	whatsAppNo,
	permanentAddress,
	dob,
}) => {
	const subject = 'Welcome to Raut Rentals';
	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">Hi ${tenantName}, welcome to Raut Rentals. Your tenant profile has been created successfully.</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Name: <strong style="color:#0f2419;">${tenantName}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Email: <strong style="color:#0f2419;">${to}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">WhatsApp: <strong style="color:#0f2419;">${whatsAppNo || 'N/A'}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Date of Birth: <strong style="color:#0f2419;">${formatDate(dob)}</strong></p>
			<p style="margin:0;font-size:13px;color:#4a7560;">Address: <strong style="color:#0f2419;">${permanentAddress || 'N/A'}</strong></p>
		</div>
	`;

	const html = renderCard({
		title: 'Welcome Aboard',
		subtitle: 'Raut Rentals',
		body,
	});

	const text = [
		`Hi ${tenantName},`,
		'Welcome to Raut Rentals. Your tenant profile has been created successfully.',
		`Email: ${to}`,
		`WhatsApp: ${whatsAppNo || 'N/A'}`,
		`Date of Birth: ${formatDate(dob)}`,
		`Address: ${permanentAddress || 'N/A'}`,
	].join('\n');

	return sendEmail({ to, subject, html, text });
};

const sendRentReminderEmail = async (payload) => {
	const template = buildRentReminderTemplate(payload);
	return sendEmail({ to: payload.to, ...template });
};

const sendRentDueEmail = async (payload) => {
	const template = buildRentDueTemplate(payload);
	return sendEmail({ to: payload.to, ...template });
};

const sendAgreementExpiryEmail = async (payload) => {
	const template = buildAgreementExpiryTemplate(payload);
	return sendEmail({ to: payload.to, ...template });
};

const sendPaymentReceiptEmail = async ({
	to,
	tenantName,
	propertyName,
	receiptNumber,
	ledgerMonth,
	amount,
	paymentMode,
	receivedOn,
	isAdvance,
	advanceForMonth,
	upiTransactionId,
	chequeNumber,
	bankName,
	outstanding,
}) => {
	const subject = `Payment Received - Receipt ${receiptNumber}`;
	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">Hi ${tenantName}, we have received your payment. Please find your receipt details below.</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Receipt No: <strong style="color:#0f2419;">${receiptNumber}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Property: <strong style="color:#0f2419;">${propertyName}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Month: <strong style="color:#0f2419;">${isAdvance ? `${advanceForMonth || ledgerMonth} (Advance)` : ledgerMonth}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Amount Received: <strong style="color:#1a6b3c;">${formatCurrency(amount)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Payment Mode: <strong style="color:#0f2419;">${paymentMode}</strong></p>
			${upiTransactionId ? `<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">UPI Txn ID: <strong style="color:#0f2419;">${upiTransactionId}</strong></p>` : ''}
			${chequeNumber ? `<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Cheque No: <strong style="color:#0f2419;">${chequeNumber}</strong></p>` : ''}
			${bankName ? `<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Bank: <strong style="color:#0f2419;">${bankName}</strong></p>` : ''}
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Received On: <strong style="color:#0f2419;">${formatDate(receivedOn)}</strong></p>
			<p style="margin:0;font-size:13px;color:#4a7560;">Outstanding Balance: <strong style="color:${Number(outstanding || 0) > 0 ? '#d93025' : '#1a6b3c'};">${formatCurrency(outstanding || 0)}</strong></p>
		</div>
	`;

	const html = renderCard({
		title: 'Payment Acknowledgement',
		subtitle: 'Raut Rentals',
		body,
	});

	const text = [
		`Hi ${tenantName},`,
		'We have received your payment.',
		`Receipt No: ${receiptNumber}`,
		`Property: ${propertyName}`,
		`Month: ${isAdvance ? `${advanceForMonth || ledgerMonth} (Advance)` : ledgerMonth}`,
		`Amount Received: ${formatCurrency(amount)}`,
		`Payment Mode: ${paymentMode}`,
		upiTransactionId ? `UPI Txn ID: ${upiTransactionId}` : null,
		chequeNumber ? `Cheque No: ${chequeNumber}` : null,
		bankName ? `Bank: ${bankName}` : null,
		`Received On: ${formatDate(receivedOn)}`,
		`Outstanding Balance: ${formatCurrency(outstanding || 0)}`,
	].filter(Boolean).join('\n');

	return sendEmail({ to, subject, html, text });
};

module.exports = {
	sendEmail,
	sendAgreementCreatedEmail,
	sendAgreementTerminatedEmail,
	sendTenantWelcomeEmail,
	sendRentReminderEmail,
	sendRentDueEmail,
	sendAgreementExpiryEmail,
	sendPaymentReceiptEmail,
};
