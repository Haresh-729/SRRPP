import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IconTrendingUp, IconAlertCircle, IconClock, IconCheck, IconReceipt } from '@tabler/icons-react';
import { getMonthlyReport } from '../../../../services/repository/ReportsRepo.js';
import { getPropertySummary } from '../../../../services/repository/PropertyRepo.js';
import {
  KpiCard, LedgerStatusBadge, Loading, ErrorState, EmptyState,
  fmtMoney, fmtMoneyK, fmtMonth, collectionRate, ProgressBar,
  FetchButton, FilterSelect, FilterInput, COLORS, chartMoneyFormatter, Card, SectionTitle,
} from '../utils/reportUtils.jsx';
import Pagination from '../../../common/Pagination.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();
const LIMIT = 10;

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-3 py-2 text-xs space-y-1"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmtMoneyK(p.value)}</p>
      ))}
    </div>
  );
};

export default function MonthlyReport() {
  const dispatch = useDispatch();
  const [year,       setYear]       = useState(String(now.getFullYear()));
  const [month,      setMonth]      = useState(String(now.getMonth() + 1));
  const [propertyId, setPropertyId] = useState('');
  const [page,       setPage]       = useState(1);
  const [result,     setResult]     = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [expanded,   setExpanded]   = useState(null);

  const fetchReport = (pg = 1) => {
    if (!year || !month) return;
    setLoading(true); setError(null);
    dispatch(getMonthlyReport({ year, month, propertyId: propertyId || undefined, page: pg, limit: LIMIT }))
      .then(r => {
        if (r) setResult(r);
        else setError('Failed to load monthly report.');
        setLoading(false);
      });
  };

  useEffect(() => {
    dispatch(getPropertySummary()).then(r => { if (r && Array.isArray(r)) setProperties(r); });
    fetchReport();
  }, []);

  const summary  = result?.data?.summary  || {};
  const period   = result?.data?.period   || {};
  const ledgers  = result?.data?.ledgers  || [];
  const meta     = result?.data?.meta     || { total: 0, totalPages: 1 };

  const breakdown = summary.statusBreakdown || {};

  const chartData = [{
    name: period.ledgerMonth ? fmtMonth(period.ledgerMonth) : `${year}-${month.padStart(2,'0')}`,
    Expected: Number(summary.totalExpected || 0),
    Collected: Number(summary.totalCollected || 0),
  }];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Year</label>
            <FilterInput type="number" value={year} onChange={setYear} min="2020" max="2030" placeholder="Year" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Month</label>
            <FilterSelect value={month} onChange={setMonth}>
              {MONTHS.map((m, i) => <option key={i} value={String(i+1)}>{m}</option>)}
            </FilterSelect>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Property</label>
            <FilterSelect value={propertyId} onChange={setPropertyId}>
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </FilterSelect>
          </div>
          <FetchButton onClick={() => { setPage(1); fetchReport(1); }} loading={loading} />
        </div>
      </Card>

      {loading ? <Loading label={`Loading ${MONTHS[+month-1]} ${year} report...`} /> : error ? <ErrorState msg={error} onRetry={() => fetchReport(page)} /> : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard icon={IconClock}     label="Expected"      value={fmtMoneyK(summary.totalExpected)}     color={COLORS.primary} />
            <KpiCard icon={IconCheck}     label="Collected"     value={fmtMoneyK(summary.totalCollected)}    color={COLORS.success} />
            <KpiCard icon={IconAlertCircle} label="Pending"     value={fmtMoneyK(summary.totalPending)}      color={COLORS.warning} />
            <KpiCard icon={IconAlertCircle} label="Overdue"     value={fmtMoneyK(summary.totalOverdue)}      color={COLORS.danger}  />
            <KpiCard icon={IconReceipt}   label="Transactions"  value={summary.totalPaymentTransactions || 0} color={COLORS.primary} />
          </div>

          {/* Status breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <Card>
              <div className="p-5">
                <SectionTitle>Status Breakdown</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['PAID','PARTIAL','PENDING','OVERDUE'].map(s => {
                    const d = breakdown[s] || {};
                    const statusColors = { PAID: COLORS.success, PARTIAL: COLORS.warning, PENDING: COLORS.muted, OVERDUE: COLORS.danger };
                    return (
                      <div key={s} className="rounded-xl p-3 border"
                        style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: statusColors[s] }}>{s}</p>
                        <p className="text-lg font-extrabold" style={{ color: 'var(--text-main)' }}>{d.count || 0}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Due: {fmtMoneyK(d.totalDue || 0)}
                        </p>
                        <p className="text-xs" style={{ color: statusColors[s] }}>
                          Paid: {fmtMoneyK(d.paidAmount || 0)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Bar chart */}
          <Card>
            <div className="p-5">
              <SectionTitle>Collected vs Expected — {MONTHS[+month-1]} {year}</SectionTitle>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tickFormatter={fmtMoneyK} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Expected"  fill={COLORS.border}   radius={[4,4,0,0]} />
                  <Bar dataKey="Collected" fill={COLORS.primary}  radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Ledgers table */}
          <Card>
            <div className="p-5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
              <SectionTitle>Ledger Details ({meta.total} total)</SectionTitle>
            </div>
            {!ledgers.length ? <EmptyState msg="No ledger entries for this period." /> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                        {['#','Property','Tenant','Rent Amt','Carry Fwd','Total Due','Paid','Balance','Due Date','Status','Pymts'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide whitespace-nowrap"
                            style={{ color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledgers.map((l, i) => {
                        const carry = Number(l.balance_from_previous || 0);
                        const bal   = Number(l.balance_carried || 0);
                        const isExp = expanded === l.id;
                        return (
                          <>
                            <tr key={l.id}
                              onClick={() => setExpanded(isExp ? null : l.id)}
                              className="cursor-pointer"
                              style={{ borderBottom: '1px solid var(--surface-border)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                              <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{(page-1)*LIMIT+i+1}</td>
                              <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{l.properties?.name || '—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{l.tenants?.full_name || '—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.rent_amount)}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: carry > 0 ? COLORS.warning : 'var(--text-muted)' }}>{carry > 0 ? fmtMoney(carry) : '—'}</td>
                              <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.total_due)}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: COLORS.success }}>{fmtMoney(l.paid_amount)}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: bal > 0 ? COLORS.danger : 'var(--text-muted)' }}>{bal > 0 ? fmtMoney(bal) : '—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{fmt(l.due_date)}</td>
                              <td className="px-4 py-3"><LedgerStatusBadge status={l.status} /></td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                                  style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: COLORS.primary }}>
                                  {l.payments?.length || 0}
                                </span>
                              </td>
                            </tr>
                            {isExp && l.payments?.length > 0 && (
                              <tr key={`${l.id}-exp`} style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                <td colSpan={11} className="px-6 py-3">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        {['Amount','Mode','Received On'].map(h => (
                                          <th key={h} className="py-1 pr-6 text-left font-semibold"
                                            style={{ color: 'var(--text-muted)' }}>{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {l.payments.map(p => (
                                        <tr key={p.id}>
                                          <td className="py-1.5 pr-6 font-semibold" style={{ color: COLORS.primary }}>{fmtMoney(p.amount)}</td>
                                          <td className="py-1.5 pr-6" style={{ color: 'var(--text-muted)' }}>{p.payment_mode}</td>
                                          <td className="py-1.5 pr-6" style={{ color: 'var(--text-muted)' }}>{fmt(p.received_on)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {meta.total > LIMIT && (
                  <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
                      itemsPerPage={LIMIT} onPageChange={p => { setPage(p); fetchReport(p); }} />
                  </div>
                )}
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}