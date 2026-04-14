const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (iso) => {
	if (!iso) return 'N/A';
	return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const renderCard = ({ title, subtitle, body }) => `
	<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:14px;max-width:640px;margin:0 auto;font-family:Montserrat,Arial,sans-serif;color:#0f2419;overflow:hidden;">
		<div style="background:linear-gradient(135deg,#0f2419,#1a6b3c);padding:18px 22px;">
			<h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;">${title}</h1>
			<p style="margin:6px 0 0;font-size:13px;color:#e6f4ec;">${subtitle}</p>
		</div>
		<div style="padding:18px 22px;background:#f4f7f5;">${body}</div>
	</div>
`;

const buildRentDueTemplate = ({
	tenantName,
	propertyName,
	ledgerMonth,
	dueDate,
	rentAmount,
	gstAmount,
	totalDue,
	overdueByOneDay,
}) => {
	const title = overdueByOneDay ? 'Rent Overdue Notice' : 'Rent Due Today';
	const subject = overdueByOneDay
		? `Payment Overdue: ${propertyName} (${ledgerMonth})`
		: `Rent Due Today: ${propertyName} (${ledgerMonth})`;

	const body = `
		<p style="margin:0 0 12px;font-size:14px;color:#4a7560;">
			Hi ${tenantName}, ${overdueByOneDay ? 'your rent payment is overdue by 1 day.' : 'your rent payment is due today.'}
		</p>
		<div style="background:#ffffff;border:1px solid #d1e5d9;border-radius:10px;padding:14px;">
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Property: <strong style="color:#0f2419;">${propertyName}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Month: <strong style="color:#0f2419;">${ledgerMonth}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Due Date: <strong style="color:#0f2419;">${formatDate(dueDate)}</strong></p>
			<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">Rent: <strong style="color:#0f2419;">${formatCurrency(rentAmount)}</strong></p>
			${Number(gstAmount || 0) > 0 ? `<p style="margin:0 0 8px;font-size:13px;color:#4a7560;">GST: <strong style="color:#e8a020;">${formatCurrency(gstAmount)}</strong></p>` : ''}
			<p style="margin:0;font-size:14px;color:#4a7560;">Total Due: <strong style="color:#d93025;">${formatCurrency(totalDue)}</strong></p>
		</div>
	`;

	const html = renderCard({ title, subtitle: 'Raut Rentals', body });

	const text = [
		`Hi ${tenantName},`,
		overdueByOneDay ? 'Your rent is overdue by 1 day.' : 'Your rent is due today.',
		`Property: ${propertyName}`,
		`Month: ${ledgerMonth}`,
		`Due Date: ${formatDate(dueDate)}`,
		`Rent: ${formatCurrency(rentAmount)}`,
		Number(gstAmount || 0) > 0 ? `GST: ${formatCurrency(gstAmount)}` : null,
		`Total Due: ${formatCurrency(totalDue)}`,
	].filter(Boolean).join('\n');

	return { subject, html, text };
};

module.exports = { buildRentDueTemplate };
