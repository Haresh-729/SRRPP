import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconBook, IconBook2, IconX } from '@tabler/icons-react';
import { getLedgerById } from '../../../../services/repository/PaymentRepo.js';
import RecordPaymentModal from './RecordPaymentModal.jsx';

const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT    = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (n)   => n   != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtMonth = (s)   => { if (!s) return '—'; const [y, m] = s.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };

const StatusBadge = ({ status }) => {
  const map = { PAID: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' }, PARTIAL: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' }, PENDING: { bg: 'rgba(100,100,100,0.1)', c: 'var(--text-muted)' }, OVERDUE: { bg: 'rgba(217,48,37,0.1)', c: 'var(--danger)' } };
  const cfg = map[status] || map.PENDING;
  return <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>;
};

const LedgerDetailDrawer = ({ isOpen, ledgerId, onClose, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  const [ledger, setLedger]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [recordModal, setRecordModal] = useState(false);

  const fetchLedger = () => {
    if (!ledgerId) return;
    setLoading(true);
    dispatch(getLedgerById(ledgerId)).then(r => { setLedger(r); setLoading(false); });
  };

  useEffect(() => { if (isOpen && ledgerId) fetchLedger(); }, [isOpen, ledgerId]);
  useEffect(() => { if (!isOpen) setLedger(null); }, [isOpen]);

  if (!isOpen) return null;

  const prop = ledger?.properties;
  const ten  = ledger?.tenants;
  const ag   = ledger?.agreements;
  const arc  = ledger?.agreement_rent_cycles;
  const payments = ledger?.payments || [];
  const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);
  const totalDue = Number(ledger?.total_due || 0);
  const pct = totalDue > 0 ? Math.min(100, (totalCollected / totalDue) * 100) : 0;
  const balance = Number(ledger?.balance_carried || 0);
  const gstApplicable = Boolean(ledger?.gst_applicable_this_month);
  const gstAmount = Number(ledger?.gst_amount || 0);
  const canRecord = ag?.status === 'ACTIVE' && ledger?.status !== 'PAID';

  const handlePaymentSuccess = () => { fetchLedger(); onPaymentSuccess?.(); };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-130 flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            <IconBook2 size={18} style={{ color: 'var(--brand-primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Ledger Details</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : !ledger ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load ledger.</p>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>{fmtMonth(ledger.ledger_month)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Due: {fmt(ledger.due_date)}</p>
                </div>
                <StatusBadge status={ledger.status} />
              </div>

              {/* Financial summary grid */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-border)' }}>
                <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y" style={{ borderColor: 'var(--surface-border)' }}>
                  {[
                    { label: 'Rent Amount', value: fmtMoney(ledger.rent_amount), c: 'var(--text-main)' },
                    ...(gstApplicable ? [{ label: 'GST Amount', value: fmtMoney(gstAmount), c: 'var(--warning)' }] : []),
                    { label: 'Carry Fwd',   value: Number(ledger.balance_from_previous) > 0 ? fmtMoney(ledger.balance_from_previous) : '₹0', c: Number(ledger.balance_from_previous) > 0 ? 'var(--warning)' : 'var(--text-muted)' },
                    { label: 'Total Due',   value: fmtMoney(ledger.total_due), c: 'var(--text-main)', bold: true },
                    { label: 'Paid',        value: fmtMoney(ledger.paid_amount), c: 'var(--success)' },
                  ].map(item => (
                    <div key={item.label} className="p-4" style={{ backgroundColor: 'var(--surface-bg)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.c }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Total due = rent + GST + carry forward
                  </span>
                </div>
                {balance > 0 && (
                  <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
                      Balance Carried: {fmtMoney(balance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Rent Cycle */}
              {arc && (
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Rent Cycle</p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div><p style={{ color: 'var(--text-muted)' }}>Cycle</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>#{arc.cycle_number}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Cycle Rent</p><p className="font-semibold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(arc.monthly_rent)}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Period</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmt(arc.start_date)} → {fmt(arc.end_date)}</p></div>
                  </div>
                </div>
              )}

              {/* Property & Tenant */}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Property & Tenant</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Property</span>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{prop?.name || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tenant</span>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{ten?.full_name || '—'}</span>
                  </div>
                  {ag && (
                    <div className="flex justify-between py-1" style={{ borderColor: 'var(--surface-border)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Agreement</span>
                      <span className="font-medium" style={{ color: 'var(--text-main)' }}>
                        {fmt(ag.start_date)} → {fmt(ag.end_date)}
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                          style={{ backgroundColor: ag.status === 'ACTIVE' ? 'rgba(30,140,74,0.1)' : 'rgba(217,48,37,0.08)', color: ag.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}>
                          {ag.status}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                    Payments Recorded ({payments.length})
                  </p>
                  {canRecord && (
                    <button onClick={() => setRecordModal(true)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                      {payments.length > 0 ? 'Record Another' : 'Record Payment'}
                    </button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No payments recorded for this month</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p, i) => (
                      <div key={p.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(p.amount)}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                              {p.payment_mode}
                            </span>
                          </div>
                          {p.is_advance && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>
                              Advance{p.advance_for_month ? ` for ${fmtMonth(p.advance_for_month)}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Received: {fmt(p.received_on)}</p>
                        {p.payment_mode === 'CHEQUE' && p.cheque_number && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Cheque #{p.cheque_number} · {p.bank_name || ''} · {fmt(p.cheque_date)}
                          </p>
                        )}
                        {p.payment_mode === 'UPI' && p.upi_transaction_id && (
                          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{p.upi_transaction_id}</p>
                        )}
                        {p.cheque_photo && (
                          <a href={p.cheque_photo} target="_blank" rel="noopener noreferrer">
                            <img src={p.cheque_photo} alt="Cheque" className="w-16 h-12 object-cover rounded mt-2 border cursor-pointer hover:opacity-80"
                              style={{ borderColor: 'var(--surface-border)' }} />
                          </a>
                        )}
                        {p.remarks && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Remarks: {p.remarks}</p>}
                        <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>Recorded {fmtDT(p.created_at)}</p>
                      </div>
                    ))}

                    {/* Progress bar */}
                    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: 'var(--text-muted)' }}>Total Collected: <span className="font-semibold" style={{ color: 'var(--success)' }}>{fmtMoney(totalCollected)}</span> of <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(totalDue)}</span></span>
                        <span style={{ color: 'var(--text-muted)' }}>{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--surface-border)' }}>
                        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'var(--brand-primary)' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecordPaymentModal isOpen={recordModal} ledger={ledger}
        onClose={() => setRecordModal(false)} onSuccess={handlePaymentSuccess} />
    </>
  );
};

export default LedgerDetailDrawer;