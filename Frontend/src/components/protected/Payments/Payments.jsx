import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconRefresh, IconReceipt, IconCheck, IconArrowForwardUp,
  IconAlertTriangle, IconBan, IconApiApp,
  IconBook2
} from '@tabler/icons-react';
import {
  listPayments, listLedgers,
} from '../../../services/repository/PaymentRepo.js';
import { getPropertySummary } from '../../../services/repository/PropertyRepo.js';
import { getTenantSummary } from '../../../services/repository/TenantRepo.js';
import { listAgreements } from '../../../services/repository/AgreementRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../services/utils/rbac.js';
import Pagination from '../../common/Pagination.jsx';
import PaymentDetailDrawer from './utils/PaymentDetailDrawer.jsx';
import LedgerDetailDrawer from './utils/LedgerDetailDrawer.jsx';
import RecordPaymentModal from './utils/RecordPaymentModal.jsx';
import AdvancePaymentModal from './utils/AdvancePaymentModal.jsx';

const LIMIT = 10;
const fmtMoney = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMonth = (s)   => { if (!s) return '—'; const [y, m] = s.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };
const today    = new Date().toISOString().split('T')[0];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border"
    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
    </div>
  </div>
);

// ── Payments Tab ──────────────────────────────────────────────────────────────
const PaymentsTab = ({ properties, tenants, agreements, onPaymentView }) => {
  const dispatch = useDispatch();
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [agreementId, setAgreementId] = useState('');
  const [tenantId,    setTenantId]    = useState('');
  const [propertyId,  setPropertyId]  = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [isAdvance,   setIsAdvance]   = useState('');
  const [fromDate,    setFromDate]    = useState('');
  const [toDate,      setToDate]      = useState('');
  const [page, setPage]               = useState(1);

  const fetchList = useCallback(async (params) => {
    setLoading(true); setError(null);
    const result = await dispatch(listPayments({
      agreementId: params.agreementId || undefined,
      tenantId:    params.tenantId    || undefined,
      propertyId:  params.propertyId  || undefined,
      paymentMode: params.paymentMode || undefined,
      isAdvance:   params.isAdvance !== '' ? params.isAdvance : undefined,
      fromDate:    params.fromDate    || undefined,
      toDate:      params.toDate      || undefined,
      page: params.page, limit: LIMIT,
    }));
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load payments.');
  }, [dispatch]);

  useEffect(() => { fetchList({ agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate, page }); }, []);

  const apply = (field, val) => {
    const next = { agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate, page: 1 };
    next[field] = val;
    if (field === 'agreementId') setAgreementId(val);
    if (field === 'tenantId')    setTenantId(val);
    if (field === 'propertyId')  setPropertyId(val);
    if (field === 'paymentMode') setPaymentMode(val);
    if (field === 'isAdvance')   setIsAdvance(val);
    if (field === 'fromDate')    setFromDate(val);
    if (field === 'toDate')      setToDate(val);
    setPage(1); fetchList(next);
  };

  const reset = () => {
    setAgreementId(''); setTenantId(''); setPropertyId(''); setPaymentMode(''); setIsAdvance(''); setFromDate(''); setToDate(''); setPage(1);
    fetchList({ agreementId: '', tenantId: '', propertyId: '', paymentMode: '', isAdvance: '', fromDate: '', toDate: '', page: 1 });
  };

  const total     = data.length;
  const totalAmt  = data.reduce((s, p) => s + Number(p.amount), 0);
  const regular   = data.filter(p => !p.is_advance).length;
  const advance   = data.filter(p => p.is_advance).length;

  const selStyle = { borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={IconReceipt}        label="Total Payments"  value={meta.total}                  color="var(--brand-primary)" />
        <StatCard icon={IconCheck}          label="Total Collected" value={fmtMoney(totalAmt)}          color="var(--success)" />
        <StatCard icon={IconArrowForwardUp} label="Regular"        value={regular}                     color="var(--text-muted)" />
        <StatCard icon={Icon}            label="Advance"         value={advance}                     color="var(--warning)" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <select value={agreementId} onChange={e => apply('agreementId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Agreements</option>
            {agreements.map(a => <option key={a.id} value={a.id}>{a.properties?.name} — {a.tenants?.full_name}</option>)}
          </select>
          <select value={tenantId} onChange={e => apply('tenantId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Tenants</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName || t.full_name}</option>)}
          </select>
          <select value={propertyId} onChange={e => apply('propertyId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={paymentMode} onChange={e => apply('paymentMode', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Modes</option>
            {['CASH', 'CHEQUE', 'UPI'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={isAdvance} onChange={e => apply('isAdvance', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Types</option>
            <option value="false">Regular</option>
            <option value="true">Advance</option>
          </select>
          <input type="date" value={fromDate} max={toDate || today} onChange={e => apply('fromDate', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none date-input" style={selStyle} placeholder="From Date" />
          <input type="date" value={toDate} min={fromDate} max={today} onChange={e => apply('toDate', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none date-input" style={selStyle} placeholder="To Date" />
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <IconRefresh size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
            <button onClick={() => fetchList({ agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate, page })} className="mt-2 text-sm px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}>Retry</button>
          </div>
        ) : !data.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-bg)' }}>
              <IconReceipt size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  {['#', 'Property', 'Tenant', 'Month', 'Amount', 'Mode', 'Received On', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => {
                  const modeCfg = { CASH: { bg: 'rgba(26,107,60,0.1)', c: 'var(--brand-primary)' }, CHEQUE: { bg: 'rgba(232,160,32,0.12)', c: 'var(--accent)' }, UPI: { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' } };
                  const mCfg = modeCfg[row.payment_mode] || modeCfg.CASH;
                  const ledger = row.rent_ledgers;
                  const lsCfg = { PAID: 'var(--success)', PARTIAL: 'var(--warning)', PENDING: 'var(--text-muted)', OVERDUE: 'var(--danger)' };
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{row.properties?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs max-w-[140px]">
                        <p className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{row.tenants?.full_name || '—'}</p>
                        <p className="truncate" style={{ color: 'var(--text-muted)' }}>{row.tenants?.email || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{fmtMonth(ledger?.ledger_month)}</td>
                      <td className="px-4 py-3 text-sm font-bold whitespace-nowrap" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(row.amount)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: mCfg.bg, color: mCfg.c }}>{row.payment_mode}</span>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{fmt(row.received_on)}</td>
                      <td className="px-4 py-3 text-xs">
                        {row.is_advance ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold block w-fit"
                              style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Advance</span>
                            {row.advance_for_month && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>for {fmtMonth(row.advance_for_month)}</p>}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>Regular</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {ledger?.status && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${lsCfg[ledger.status]}18`, color: lsCfg[ledger.status] }}>
                            {ledger.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => onPaymentView(row.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <IconReceipt size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
              itemsPerPage={LIMIT} onPageChange={(p) => { setPage(p); fetchList({ agreementId, tenantId, propertyId, paymentMode, isAdvance, fromDate, toDate, page: p }); }} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── Ledgers Tab ───────────────────────────────────────────────────────────────
const LedgersTab = ({ properties, tenants, agreements, isAdmin }) => {
  const dispatch = useDispatch();
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [agreementId, setAgreementId] = useState('');
  const [propertyId,  setPropertyId]  = useState('');
  const [tenantId,    setTenantId]    = useState('');
  const [status,      setStatus]      = useState('');
  const [month,       setMonth]       = useState('');
  const [page, setPage]               = useState(1);

  const [recordModal,  setRecordModal]  = useState({ open: false, ledger: null });
  const [advanceModal, setAdvanceModal] = useState({ open: false, ledger: null });
  const [ledgerDrawer, setLedgerDrawer] = useState({ open: false, id: null });

  const fetchList = useCallback(async (params) => {
    setLoading(true); setError(null);
    const result = await dispatch(listLedgers({
      agreementId: params.agreementId || undefined,
      propertyId:  params.propertyId  || undefined,
      tenantId:    params.tenantId    || undefined,
      status:      params.status      || undefined,
      month:       params.month       || undefined,
      page: params.page, limit: LIMIT,
    }));
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load ledgers.');
  }, [dispatch]);

  useEffect(() => { fetchList({ agreementId, propertyId, tenantId, status, month, page }); }, []);

  const apply = (field, val) => {
    const next = { agreementId, propertyId, tenantId, status, month, page: 1 };
    next[field] = val;
    if (field === 'agreementId') setAgreementId(val);
    if (field === 'propertyId')  setPropertyId(val);
    if (field === 'tenantId')    setTenantId(val);
    if (field === 'status')      setStatus(val);
    if (field === 'month')       setMonth(val);
    setPage(1); fetchList(next);
  };

  const reset = () => {
    setAgreementId(''); setPropertyId(''); setTenantId(''); setStatus(''); setMonth(''); setPage(1);
    fetchList({ agreementId: '', propertyId: '', tenantId: '', status: '', month: '', page: 1 });
  };

  const handleSuccess = () => fetchList({ agreementId, propertyId, tenantId, status, month, page });

  const total   = meta.total;
  const paid    = data.filter(l => l.status === 'PAID').length;
  const partial = data.filter(l => ['PENDING', 'PARTIAL'].includes(l.status)).length;
  const overdue = data.filter(l => l.status === 'OVERDUE').length;

  const lsCfg = { PAID: 'var(--success)', PARTIAL: 'var(--warning)', PENDING: 'var(--text-muted)', OVERDUE: 'var(--danger)' };
  const selStyle = { borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={IconBook2}      label="Total Ledgers"     value={total}   color="var(--brand-primary)" />
        <StatCard icon={IconCheck}         label="Paid"              value={paid}    color="var(--success)" />
        <StatCard icon={IconAlertTriangle} label="Pending / Partial" value={partial} color="var(--warning)" />
        <StatCard icon={IconBan}           label="Overdue"           value={overdue} color="var(--danger)" />
      </div>

      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <select value={agreementId} onChange={e => apply('agreementId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Agreements</option>
            {agreements.map(a => <option key={a.id} value={a.id}>{a.properties?.name} — {a.tenants?.full_name}</option>)}
          </select>
          <select value={propertyId} onChange={e => apply('propertyId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={tenantId} onChange={e => apply('tenantId', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Tenants</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName || t.full_name}</option>)}
          </select>
          <select value={status} onChange={e => apply('status', e.target.value)} className="px-3 py-2 rounded-lg border text-sm outline-none" style={selStyle}>
            <option value="">All Status</option>
            {['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="month" value={month} onChange={e => apply('month', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none date-input" style={selStyle} />
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <IconRefresh size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
          </div>
        ) : !data.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-bg)' }}>
              <IconBook2 size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No ledgers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  {['#', 'Property', 'Tenant', 'Month', 'Rent Amt', 'Carry Fwd', 'Total Due', 'Paid', 'Balance', 'Due Date', 'Payments', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => {
                  const carry   = Number(row.balance_from_previous);
                  const balance = Number(row.balance_carried);
                  const isOverdue = row.due_date && row.due_date < today && row.status !== 'PAID';
                  const canRecord = row.agreements?.status === 'ACTIVE' && !['PAID'].includes(row.status) && ['PENDING', 'PARTIAL', 'OVERDUE'].includes(row.status);
                  const canAdvance = row.agreements?.status === 'ACTIVE';
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{row.properties?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.tenants?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap font-medium" style={{ color: 'var(--text-main)' }}>{fmtMonth(row.ledger_month)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(row.rent_amount)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: carry > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {carry > 0 ? fmtMoney(carry) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs font-bold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(row.total_due)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--success)' }}>{fmtMoney(row.paid_amount)}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {balance > 0 ? fmtMoney(balance) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {fmt(row.due_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                          style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: 'var(--brand-primary)' }}>
                          {row._count?.payments ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `${lsCfg[row.status]}18`, color: lsCfg[row.status] }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {canRecord && (
                            <button onClick={() => setRecordModal({ open: true, ledger: row })} title="Record Payment"
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: 'var(--brand-primary)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                              <IconReceipt size={15} />
                            </button>
                          )}
                          {canAdvance && (
                            <button onClick={() => setAdvanceModal({ open: true, ledger: row })} title="Advance Payment"
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ color: 'var(--warning)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(232,160,32,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                              <IconApiApp size={15} />
                            </button>
                          )}
                          <button onClick={() => setLedgerDrawer({ open: true, id: row.id })} title="View"
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                            <IconBook2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
              itemsPerPage={LIMIT} onPageChange={(p) => { setPage(p); fetchList({ agreementId, propertyId, tenantId, status, month, page: p }); }} />
          </div>
        )}
      </div>

      <RecordPaymentModal isOpen={recordModal.open} ledger={recordModal.ledger}
        onClose={() => setRecordModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      <AdvancePaymentModal
        isOpen={advanceModal.open}
        agreement={advanceModal.ledger?.agreements ? { ...advanceModal.ledger.agreements, id: advanceModal.ledger.agreement_id } : null}
        propertyName={advanceModal.ledger?.properties?.name}
        tenantName={advanceModal.ledger?.tenants?.full_name}
        onClose={() => setAdvanceModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      <LedgerDetailDrawer isOpen={ledgerDrawer.open} ledgerId={ledgerDrawer.id}
        onClose={() => setLedgerDrawer(p => ({ ...p, open: false }))} onPaymentSuccess={handleSuccess} />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Payments = () => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [activeTab, setActiveTab]   = useState('ledgers');
  const [properties, setProperties] = useState([]);
  const [tenants,    setTenants]    = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [paymentDrawer, setPaymentDrawer] = useState({ open: false, id: null });

  useEffect(() => {
    dispatch(getPropertySummary()).then(r => { if (r && Array.isArray(r)) setProperties(r); });
    dispatch(getTenantSummary()).then(r => { if (r && Array.isArray(r)) setTenants(r); });
    dispatch(listAgreements({ limit: 100 })).then(r => { if (r?.data) setAgreements(r.data); });
  }, []);

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Payments</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track rent payments and ledger entries</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        {[{ key: 'ledgers', label: 'Ledgers', icon: IconBook2 }, { key: 'payments', label: 'Payments', icon: IconReceipt }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeTab === t.key ? 'var(--brand-primary)' : 'transparent',
              color: activeTab === t.key ? 'var(--text-inverse)' : 'var(--text-muted)',
            }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'payments' && (
        <PaymentsTab
          properties={properties} tenants={tenants} agreements={agreements}
          onPaymentView={id => setPaymentDrawer({ open: true, id })}
        />
      )}
      {activeTab === 'ledgers' && (
        <LedgersTab properties={properties} tenants={tenants} agreements={agreements} isAdmin={isAdmin} />
      )}

      <PaymentDetailDrawer isOpen={paymentDrawer.open} paymentId={paymentDrawer.id}
        onClose={() => setPaymentDrawer(p => ({ ...p, open: false }))} />
    </div>
  );
};

export default Payments;