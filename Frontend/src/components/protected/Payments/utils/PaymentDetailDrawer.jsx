import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconReceipt } from '@tabler/icons-react';
import { getPaymentById } from '../../../../services/repository/PaymentRepo.js';

const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT    = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (n)   => n   != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtMonth = (s)   => { if (!s) return '—'; const [y, m] = s.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };

const ModeBadge = ({ mode }) => {
  const map = { CASH: { bg: 'rgba(26,107,60,0.1)', c: 'var(--brand-primary)' }, CHEQUE: { bg: 'rgba(232,160,32,0.12)', c: 'var(--accent)' }, UPI: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' } };
  const cfg = map[mode] || map.CASH;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{mode}</span>;
};

const LedgerStatusBadge = ({ status }) => {
  const map = { PAID: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' }, PARTIAL: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' }, PENDING: { bg: 'rgba(100,100,100,0.1)', c: 'var(--text-muted)' }, OVERDUE: { bg: 'rgba(217,48,37,0.1)', c: 'var(--danger)' } };
  const cfg = map[status] || map.PENDING;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>;
};

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-medium text-right" style={{ color: 'var(--text-main)' }}>{value}</span>
  </div>
);

const PaymentDetailDrawer = ({ isOpen, paymentId, onClose }) => {
  const dispatch = useDispatch();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !paymentId) return;
    setLoading(true);
    dispatch(getPaymentById(paymentId)).then(r => { setPayment(r); setLoading(false); });
  }, [isOpen, paymentId]);

  useEffect(() => { if (!isOpen) setPayment(null); }, [isOpen]);

  if (!isOpen) return null;

  const ledger = payment?.rent_ledgers;
  const prop   = payment?.properties;
  const ten    = payment?.tenants;
  const balance = ledger ? Number(ledger.balance_carried) : 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-120 flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            <IconReceipt size={18} style={{ color: 'var(--brand-primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Payment Details</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : !payment ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load payment.</p>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-extrabold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(payment.amount)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={payment.is_advance
                        ? { backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }
                        : { backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                      {payment.is_advance ? 'Advance' : 'Regular'}
                    </span>
                    {ledger && <LedgerStatusBadge status={ledger.status} />}
                  </div>
                </div>
                <ModeBadge mode={payment.payment_mode} />
              </div>

              {/* Advance info */}
              {payment.is_advance && payment.advance_for_month && (
                <div className="flex items-center gap-2 p-3 rounded-xl border"
                  style={{ backgroundColor: 'rgba(232,160,32,0.08)', borderColor: 'rgba(232,160,32,0.3)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-main)' }}>
                    This is an advance payment for <strong>{fmtMonth(payment.advance_for_month)}</strong>
                  </p>
                </div>
              )}

              {/* Payment Details */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Payment Details</p>
                <Row label="Payment Mode" value={payment.payment_mode} />
                <Row label="Received On"  value={fmt(payment.received_on)} />
                <Row label="Remarks"      value={payment.remarks || '—'} />
              </div>

              {/* Mode-specific */}
              {payment.payment_mode === 'CHEQUE' && (
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Cheque Details</p>
                  <Row label="Cheque No"   value={payment.cheque_number || '—'} />
                  <Row label="Cheque Date" value={fmt(payment.cheque_date)} />
                  <Row label="Bank Name"   value={payment.bank_name || '—'} />
                  {payment.cheque_photo ? (
                    <div className="pt-2">
                      <a href={payment.cheque_photo} target="_blank" rel="noopener noreferrer">
                        <img src={payment.cheque_photo} alt="Cheque" className="w-24 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                          style={{ borderColor: 'var(--surface-border)' }} />
                      </a>
                    </div>
                  ) : (
                    <div className="pt-2"><p className="text-xs" style={{ color: 'var(--text-muted)' }}>No photo uploaded</p></div>
                  )}
                </div>
              )}
              {payment.payment_mode === 'UPI' && payment.upi_transaction_id && (
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>UPI Details</p>
                  <p className="text-sm font-mono" style={{ color: 'var(--text-main)' }}>{payment.upi_transaction_id}</p>
                </div>
              )}

              {/* Ledger Info */}
              {ledger && (
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Ledger Info</p>
                  <Row label="Month"           value={fmtMonth(ledger.ledger_month)} />
                  <Row label="Due Date"        value={fmt(ledger.due_date)} />
                  <Row label="Rent Amount"     value={fmtMoney(ledger.rent_amount)} />
                  {ledger.gst_applicable_this_month && <Row label="GST Amount" value={fmtMoney(ledger.gst_amount)} />}
                  <Row label="Total Due"       value={<span><span>{fmtMoney(ledger.total_due)}</span><span className="block text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>Includes GST</span></span>} />
                  <div className="flex justify-between gap-4 py-1.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Paid Amount</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>{fmtMoney(ledger.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-1.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Balance Carried</span>
                    <span className="text-xs font-medium" style={{ color: balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {balance > 0 ? fmtMoney(balance) : '—'}
                    </span>
                  </div>
                  <Row label="Ledger Status" value={<LedgerStatusBadge status={ledger.status} />} />
                </div>
              )}

              {/* Property & Tenant */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Property & Tenant</p>
                <Row label="Property" value={prop?.name || '—'} />
                {prop?.address && <Row label="Address" value={prop.address} />}
                <Row label="Tenant"   value={ten?.full_name || '—'} />
                <Row label="Email"    value={ten?.email || '—'} />
                {ten?.whats_app_no && <Row label="WhatsApp" value={`+91 ${ten.whats_app_no}`} />}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {payment && (
          <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: 'var(--surface-border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Recorded on: {fmtDT(payment.created_at)}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentDetailDrawer;