import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconX, IconEdit, IconFileText, IconBan, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { getAgreementById, getAgreementLedgers } from '../../../../services/repository/AgreementRepo.js';
import { selectAccount } from '../../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../../services/utils/rbac.js';
import UpdatePdfModal from './UpdatePdfModal.jsx';
import TerminateModal from './TerminateModal.jsx';
import DepositModal from './DepositModal.jsx';
import BrokerageModal from './BrokerageModal.jsx';

const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDT    = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (n)   => n   != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtMonth = (str) => { if (!str) return '—'; const [y, m] = str.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };

const StatusBadge = ({ status }) => {
  const map = { ACTIVE: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' }, EXPIRED: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' }, TERMINATED: { bg: 'rgba(217,48,37,0.1)', c: 'var(--danger)' } };
  const cfg = map[status] || map.EXPIRED;
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>;
};

const LedgerStatusBadge = ({ status }) => {
  const map = { PAID: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' }, PARTIAL: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' }, PENDING: { bg: 'rgba(100,100,100,0.1)', c: 'var(--text-muted)' }, OVERDUE: { bg: 'rgba(217,48,37,0.1)', c: 'var(--danger)' } };
  const cfg = map[status] || map.PENDING;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>;
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-medium text-right" style={{ color: 'var(--text-main)' }}>{value}</span>
  </div>
);

const AgreementDetailDrawer = ({ isOpen, agreementId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState('overview');

  const [ledgers, setLedgers]           = useState([]);
  const [ledgersLoading, setLedgersLoading] = useState(false);
  const [ledgersLoaded, setLedgersLoaded]   = useState(false);
  const [expandedLedger, setExpandedLedger] = useState(null);

  const [pdfModal,       setPdfModal]       = useState(false);
  const [terminateModal, setTerminateModal] = useState(false);
  const [depositModal,   setDepositModal]   = useState({ open: false, mode: 'CREATE' });
  const [brokerageModal, setBrokerageModal] = useState({ open: false, mode: 'CREATE' });

  const fetchAgreement = () => {
    if (!agreementId) return;
    setLoading(true);
    dispatch(getAgreementById(agreementId)).then(r => { setAgreement(r); setLoading(false); });
  };

  useEffect(() => {
    if (!isOpen || !agreementId) return;
    setTab('overview'); setLedgers([]); setLedgersLoaded(false); setExpandedLedger(null);
    fetchAgreement();
  }, [isOpen, agreementId]);

  useEffect(() => { if (!isOpen) setAgreement(null); }, [isOpen]);

  useEffect(() => {
    if (tab !== 'ledgers' || ledgersLoaded || !agreementId) return;
    setLedgersLoading(true);
    dispatch(getAgreementLedgers(agreementId)).then(r => {
      setLedgers(r || []); setLedgersLoading(false); setLedgersLoaded(true);
    });
  }, [tab]);

  const handleSuccess = () => { fetchAgreement(); onSuccess?.(); };

  if (!isOpen) return null;

  const prop  = agreement?.properties || agreement?.property;
  const ten   = agreement?.tenants    || agreement?.tenant;
  const brok  = agreement?.brokers    || agreement?.broker;
  const dp    = agreement?.deposit_payments   || agreement?.depositPayment;
  const bp    = agreement?.brokerage_payments || agreement?.brokeragePayment;
  const cycles = agreement?.agreement_rent_cycles || [];
  const pdfUrl = agreement?.agreement_pdf;

  const TABS = [
    { key: 'overview',   label: 'Overview'   },
    { key: 'deposit',    label: 'Deposit'    },
    { key: 'brokerage',  label: 'Brokerage'  },
    { key: 'cycles',     label: 'Rent Cycles'},
    { key: 'ledgers',    label: 'Ledgers'    },
  ];

  const ledgerSummary = {
    total: ledgers.length,
    paid:    ledgers.filter(l => l.status === 'PAID').length,
    partial: ledgers.filter(l => l.status === 'PARTIAL').length,
    pending: ledgers.filter(l => l.status === 'PENDING').length,
    overdue: ledgers.filter(l => l.status === 'OVERDUE').length,
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-3">
            {agreement && <StatusBadge status={agreement.status} />}
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>Agreement Details</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && agreement?.status === 'ACTIVE' && (
              <button onClick={() => setTerminateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
                <IconBan size={13} /> Terminate
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0 overflow-x-auto px-5" style={{ borderColor: 'var(--surface-border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-3 text-xs font-semibold border-b-2 transition-colors mr-1 whitespace-nowrap"
              style={{ borderColor: tab === t.key ? 'var(--brand-primary)' : 'transparent', color: tab === t.key ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : !agreement ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load.</p>
          ) : (
            <>
              {/* ── OVERVIEW ── */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  {/* Termination warning */}
                  {agreement.status === 'TERMINATED' && (
                    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'rgba(232,160,32,0.08)', borderColor: 'rgba(232,160,32,0.3)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--warning)' }}>TERMINATED</p>
                      <p className="text-xs" style={{ color: 'var(--text-main)' }}><strong>At:</strong> {fmtDT(agreement.terminated_at)}</p>
                      {agreement.termination_reason && <p className="text-xs mt-1" style={{ color: 'var(--text-main)' }}><strong>Reason:</strong> {agreement.termination_reason}</p>}
                    </div>
                  )}
                  {/* Property */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Property</p>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>{prop?.name || '—'}</p>
                    {prop?.property_types && <span className="text-[10px] px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>{prop.property_types.name}</span>}
                    {prop?.address && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{prop.address}</p>}
                  </div>
                  {/* Tenant */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Tenant</p>
                    <InfoRow label="Name"     value={ten?.full_name  || '—'} />
                    <InfoRow label="Email"    value={ten?.email      || '—'} />
                    <InfoRow label="WhatsApp" value={ten?.whats_app_no ? `+91 ${ten.whats_app_no}` : '—'} />
                  </div>
                  {/* Agreement details */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Agreement</p>
                    <InfoRow label="Duration"        value={`${agreement.duration_months} months`} />
                    <InfoRow label="Start Date"      value={fmt(agreement.start_date)} />
                    <InfoRow label="End Date"        value={fmt(agreement.end_date)} />
                    <InfoRow label="Monthly Rent"    value={fmtMoney(agreement.monthly_rent)} />
                    <InfoRow label="Rent Escalation" value={agreement.rent_escalation_percent && Number(agreement.rent_escalation_percent) > 0 ? `${Number(agreement.rent_escalation_percent)}%` : 'None'} />
                    <InfoRow label="Rent Due Day"    value={`${agreement.rent_due_day}th of every month`} />
                    <InfoRow label="Deposit Amount"  value={fmtMoney(agreement.deposit_amount)} />
                  </div>
                  {/* PDF */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Agreement PDF</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {pdfUrl ? (
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                          style={{ backgroundColor: 'rgba(26,107,60,0.08)', color: 'var(--brand-primary)' }}>
                          <IconFileText size={15} /> View PDF
                        </a>
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No PDF uploaded</p>
                      )}
                      {isAdmin && (
                        <button onClick={() => setPdfModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border"
                          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          {pdfUrl ? 'Update PDF' : 'Upload PDF'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── DEPOSIT ── */}
              {tab === 'deposit' && (
                <div className="space-y-4">
                  {dp ? (
                    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Deposit Payment</p>
                        {isAdmin && <button onClick={() => setDepositModal({ open: true, mode: 'UPDATE' })}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium border"
                          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Edit</button>}
                      </div>
                      <InfoRow label="Amount"       value={fmtMoney(dp.amount)} />
                      <InfoRow label="Received On"  value={fmt(dp.received_on)} />
                      <InfoRow label="Payment Mode" value={dp.payment_mode || '—'} />
                      {dp.payment_mode === 'CHEQUE' && (<>
                        <InfoRow label="Cheque No"  value={dp.cheque_number || '—'} />
                        <InfoRow label="Cheque Date" value={fmt(dp.cheque_date)} />
                        <InfoRow label="Bank Name"  value={dp.bank_name || '—'} />
                        {dp.cheque_photo && <div className="pt-2"><a href={dp.cheque_photo} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: 'var(--brand-primary)' }}>View Cheque Photo</a></div>}
                      </>)}
                      <InfoRow label="Remarks" value={dp.remarks || '—'} />
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Deposit payment not yet recorded</p>
                      {isAdmin && agreement.status === 'ACTIVE' && (
                        <button onClick={() => setDepositModal({ open: true, mode: 'CREATE' })}
                          className="px-4 py-2 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                          Record Deposit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── BROKERAGE ── */}
              {tab === 'brokerage' && (
                <div className="space-y-4">
                  {!brok ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No broker involved in this agreement</p>
                  ) : (
                    <>
                      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Broker</p>
                        <InfoRow label="Name"    value={brok.name || '—'} />
                        <InfoRow label="Contact" value={brok.contact_no ? `+91 ${brok.contact_no}` : '—'} />
                        <InfoRow label="Email"   value={brok.email || '—'} />
                      </div>
                      {!bp ? (
                        <div className="text-center py-6">
                          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Brokerage details not added yet</p>
                          {isAdmin && <button onClick={() => setBrokerageModal({ open: true, mode: 'CREATE' })}
                            className="px-4 py-2 rounded-xl text-sm font-semibold"
                            style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                            Add Brokerage Details
                          </button>}
                        </div>
                      ) : (
                        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Brokerage</p>
                            {isAdmin && <button onClick={() => setBrokerageModal({ open: true, mode: 'UPDATE' })}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium border"
                              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Edit</button>}
                          </div>
                          <InfoRow label="Type"   value={bp.brokerage_type || '—'} />
                          <InfoRow label="Value"  value={bp.brokerage_type === 'PERCENTAGE' ? `${Number(bp.brokerage_value)}%` : fmtMoney(bp.brokerage_value)} />
                          <InfoRow label="Amount" value={fmtMoney(bp.brokerage_amount)} />
                          <InfoRow label="Status" value={bp.is_paid ? '✓ Paid' : 'Pending'} />
                          {bp.is_paid && <InfoRow label="Paid On" value={fmt(bp.paid_on)} />}
                          {bp.payment_mode && <InfoRow label="Payment Mode" value={bp.payment_mode} />}
                          {bp.cheque_photo && <div className="pt-2"><a href={bp.cheque_photo} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: 'var(--brand-primary)' }}>View Cheque Photo</a></div>}
                          {bp.remarks && <InfoRow label="Remarks" value={bp.remarks} />}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── RENT CYCLES ── */}
              {tab === 'cycles' && (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-border)' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        {['Cycle', 'Start Date', 'End Date', 'Monthly Rent'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cycles.length ? cycles.map((c, i) => {
                        const now = new Date();
                        const isActive = new Date(c.start_date) <= now && new Date(c.end_date) >= now;
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--surface-border)', borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent' }}>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-main)' }}>Cycle {c.cycle_number || i + 1}</td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{fmt(c.start_date)}</td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{fmt(c.end_date)}</td>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(c.monthly_rent)}</td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No rent cycles found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── LEDGERS ── */}
              {tab === 'ledgers' && (
                <div className="space-y-3">
                  {/* Summary bar */}
                  {ledgersLoaded && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[['Total', ledgerSummary.total, 'var(--text-muted)'], ['Paid', ledgerSummary.paid, 'var(--success)'], ['Partial', ledgerSummary.partial, 'var(--warning)'], ['Pending', ledgerSummary.pending, 'var(--text-muted)'], ['Overdue', ledgerSummary.overdue, 'var(--danger)']].map(([l, v, c]) => (
                        <span key={l} className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ backgroundColor: 'var(--surface-bg)', color: c, border: '1px solid var(--surface-border)' }}>
                          {l}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  {ledgersLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
                    </div>
                  ) : !ledgers.length ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No ledger entries found</p>
                  ) : (
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-border)' }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                            {['', 'Month', 'Cycle', 'Rent', 'Carry Fwd', 'Total Due', 'Paid', 'Balance', 'Due Date', 'Status'].map(h => (
                              <th key={h} className="px-3 py-3 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ledgers.map(l => (
                            <>
                              <tr key={l.id}
                                onClick={() => setExpandedLedger(expandedLedger === l.id ? null : l.id)}
                                className="cursor-pointer"
                                style={{ borderBottom: '1px solid var(--surface-border)' }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                                <td className="px-3 py-3">
                                  {expandedLedger === l.id ? <IconChevronDown size={12} style={{ color: 'var(--text-muted)' }} /> : <IconChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap font-medium" style={{ color: 'var(--text-main)' }}>{fmtMonth(l.ledger_month)}</td>
                                <td className="px-3 py-3" style={{ color: 'var(--text-muted)' }}>{l.agreement_rent_cycles?.cycle_number || '—'}</td>
                                <td className="px-3 py-3" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.rent_amount)}</td>
                                <td className="px-3 py-3" style={{ color: Number(l.balance_from_previous) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {Number(l.balance_from_previous) > 0 ? fmtMoney(l.balance_from_previous) : '—'}
                                </td>
                                <td className="px-3 py-3 font-bold" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.total_due)}</td>
                                <td className="px-3 py-3" style={{ color: 'var(--success)' }}>{fmtMoney(l.paid_amount)}</td>
                                <td className="px-3 py-3" style={{ color: Number(l.balance_carried) > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                  {Number(l.balance_carried) > 0 ? fmtMoney(l.balance_carried) : '—'}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{fmt(l.due_date)}</td>
                                <td className="px-3 py-3"><LedgerStatusBadge status={l.status} /></td>
                              </tr>
                              {expandedLedger === l.id && (
                                <tr key={`${l.id}-exp`} style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                  <td colSpan={10} className="px-6 py-3">
                                    {!l.payments?.length ? (
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No payments recorded for this month</p>
                                    ) : (
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr>
                                            {['Payment #', 'Amount', 'Mode', 'Received On', 'Advance?', 'Remarks'].map(h => (
                                              <th key={h} className="py-1.5 pr-4 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {l.payments.map((p, pi) => (
                                            <tr key={p.id}>
                                              <td className="py-1.5 pr-4" style={{ color: 'var(--text-muted)' }}>#{pi + 1}</td>
                                              <td className="py-1.5 pr-4 font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(p.amount)}</td>
                                              <td className="py-1.5 pr-4" style={{ color: 'var(--text-muted)' }}>{p.payment_mode}</td>
                                              <td className="py-1.5 pr-4" style={{ color: 'var(--text-muted)' }}>{fmt(p.received_on)}</td>
                                              <td className="py-1.5 pr-4">{p.is_advance ? <span style={{ color: 'var(--brand-primary)' }}>Yes</span> : '—'}</td>
                                              <td className="py-1.5 pr-4" style={{ color: 'var(--text-muted)' }}>{p.remarks || '—'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </td>
                                </tr>
                              )}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <UpdatePdfModal isOpen={pdfModal} agreementId={agreementId} existingPdf={pdfUrl}
        onClose={() => setPdfModal(false)} onSuccess={handleSuccess} />
      <TerminateModal isOpen={terminateModal} agreementId={agreementId}
        onClose={() => setTerminateModal(false)} onSuccess={() => { handleSuccess(); onClose(); }} />
      <DepositModal isOpen={depositModal.open} mode={depositModal.mode} agreementId={agreementId}
        depositAmount={agreement?.deposit_amount} existing={dp}
        onClose={() => setDepositModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />
      <BrokerageModal isOpen={brokerageModal.open} mode={brokerageModal.mode} agreementId={agreementId}
        monthlyRent={agreement?.monthly_rent} existing={bp}
        onClose={() => setBrokerageModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />
    </>
  );
};

export default AgreementDetailDrawer;