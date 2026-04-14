const formatDate = (iso) => {
	if (!iso) return 'N/A';
	return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const renderCard = ({ title, subtitle, body }) => `
	<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:14px;max-width:640px;margin:0 auto;font-family:Montserrat,Arial,sans-serif;color:#0f2419;overflow:hidden;">
		<div style="background:linear-gradient(135deg,#1a6b3c,#26784a);padding:18px 22px;">
			<h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;">${title}</h1>
			<p style="margin:6px 0 0;font-size:13px;color:#e6f4ec;">${subtitle}</p>
		</div>
		<div style="padding:18px 22px;background:#f4f7f5;">${body}</div>
	</div>
`;

const buildAgreementExpiryTemplate = ({ tenantName, propertyName, endDate }) => {
	const subject = `Agreement Expiry Reminder: ${propertyName}`;
	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">Hi ${tenantName}, your current rental agreement is approaching expiry.</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Property: <strong style="color:#0f2419;">${propertyName}</strong></p>
			<p style="margin:0;font-size:13px;color:#4a7560;">Agreement End Date: <strong style="color:#0f2419;">${formatDate(endDate)}</strong></p>
		</div>
	`;

	const html = renderCard({
		title: 'Agreement Expiring Soon',
		subtitle: 'Raut Rentals',
		body,
	});

	const text = [
		`Hi ${tenantName},`,
		`Your agreement for ${propertyName} is expiring on ${formatDate(endDate)}.`,
	].join('\n');

	return { subject, html, text };
};

module.exports = { buildAgreementExpiryTemplate };
