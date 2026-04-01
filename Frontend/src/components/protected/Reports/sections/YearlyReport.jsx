import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { IconBuilding, IconTrendingUp, IconAlertCircle, IconReceipt } from '@tabler/icons-react';
import { getYearlyReport } from '../../../../services/repository/ReportsRepo.js';
import { getPropertySummary } from '../../../../services/repository/PropertyRepo.js';
import {
  KpiCard, Loading, ErrorState, EmptyState, ProgressBar,
  fmtMoney, fmtMoneyK, collectionRate, COLORS, Card, SectionTitle,
  FetchButton, FilterSelect, FilterInput, chartMoneyFormatter,
} from '../utils/reportUtils.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const now = new Date();

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

export default function YearlyReport() {
  const dispatch = useDispatch();
  const [year,       setYear]       = useState(String(now.getFullYear()));
  const [propertyId, setPropertyId] = useState('');
  const [data,       setData]       = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchReport = () => {
    if (!year) return;
    setLoading(true); setError(null);
    dispatch(getYearlyReport({ year, propertyId: propertyId || undefined })).then(r => {
      if (r) setData(r); else setError('Failed to load yearly report.');
      setLoading(false);
    });
  };

  useEffect(() => {
    dispatch(getPropertySummary()).then(r => { if (r && Array.isArray(r)) setProperties(r); });
    fetchReport();
  }, []);

  const totals   = data?.totals          || {};
  const monthly  = data?.monthlyBreakdown || [];
  const propSumm = data?.propertySummary  || [];

  const chartData = monthly.map((m, i) => ({
    name: MONTHS[m.month - 1] || `M${m.month}`,
    Due: Number(m.totalDue),
    Collected: Number(m.totalCollected),
    transactions: m.paymentTransactions,
  }));

  const avgCollected = monthly.length
    ? monthly.reduce((s, m) => s + Number(m.totalCollected), 0) / monthly.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Year</label>
            <FilterInput type="number" value={year} onChange={setYear} min="2020" max="2030" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Property</label>
            <FilterSelect value={propertyId} onChange={setPropertyId}>
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </FilterSelect>
          </div>
          <FetchButton onClick={fetchReport} loading={loading} />
        </div>
      </Card>

      {loading ? <Loading label={`Loading ${year} report...`} /> : error ? <ErrorState msg={error} onRetry={fetchReport} /> : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard icon={IconBuilding}   label="Total Due"       value={fmtMoneyK(totals.totalDue)}         color={COLORS.primary} />
            <KpiCard icon={IconTrendingUp} label="Total Collected" value={fmtMoneyK(totals.totalCollected)}   color={COLORS.success} />
            <KpiCard icon={IconAlertCircle} label="Outstanding"    value={fmtMoneyK(totals.totalOutstanding)} color={totals.totalOutstanding > 0 ? COLORS.danger : COLORS.success} />
            <KpiCard icon={IconReceipt}    label="Transactions"    value={totals.totalTransactions || 0}       color={COLORS.primary} />
          </div>

          {/* Bar chart */}
          <Card>
            <div className="p-5">
              <SectionTitle>Monthly Collection vs Due — {year}</SectionTitle>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tickFormatter={fmtMoneyK} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={50} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Due"       name="Due"       fill={COLORS.border}   radius={[3,3,0,0]} />
                  <Bar dataKey="Collected" name="Collected" fill={COLORS.primary}  radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Area chart - collection trend */}
          <Card>
            <div className="p-5">
              <SectionTitle>Collection Trend — {year}</SectionTitle>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tickFormatter={fmtMoneyK} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={50} />
                  <Tooltip formatter={chartMoneyFormatter} contentStyle={{ fontSize: 11 }} />
                  <ReferenceLine y={avgCollected} stroke={COLORS.accent} strokeDasharray="4 2"
                    label={{ value: `Avg ${fmtMoneyK(avgCollected)}`, fill: COLORS.accent, fontSize: 10 }} />
                  <Area type="monotone" dataKey="Collected" stroke={COLORS.primary} fill="url(#collectGrad)"
                    strokeWidth={2} dot={{ fill: COLORS.primary, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly breakdown table */}
          <Card>
            <div className="p-5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
              <SectionTitle>Monthly Breakdown</SectionTitle>
            </div>
            {!monthly.length ? <EmptyState msg="No monthly data." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      {['Month','Ledgers','Total Due','Collected','Outstanding','Transactions','Collection %'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide whitespace-nowrap"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthly.map((m, i) => {
                      const pct = collectionRate(m.totalCollected, m.totalDue);
                      const outstanding = Number(m.totalBalance || 0);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                            {MONTHS[m.month - 1]} {year}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.ledgerCount}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(m.totalDue)}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: COLORS.success }}>{fmtMoney(m.totalCollected)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: outstanding > 0 ? COLORS.danger : 'var(--text-muted)' }}>
                            {outstanding > 0 ? fmtMoney(outstanding) : '—'}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.paymentTransactions}</td>
                          <td className="px-4 py-3 min-w-[120px]">
                            <ProgressBar pct={pct} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Property summary */}
          {propSumm.length > 0 && (
            <Card>
              <div className="p-5">
                <SectionTitle>Property-wise Summary</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {propSumm.map((p, i) => (
                    <div key={i} className="rounded-xl border p-4"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-main)' }}>{p.property?.name || '—'}</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{p.property?.address || ''}</p>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Collected:</span>
                        <span className="font-semibold" style={{ color: COLORS.success }}>{fmtMoney(p.totalCollected)}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span style={{ color: 'var(--text-muted)' }}>Transactions:</span>
                        <span style={{ color: 'var(--text-main)' }}>{p.totalTransactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}