import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { IconTrendingUp, IconReceipt, IconFileText, IconUsers, IconBuilding } from '@tabler/icons-react';
import { getLifetimeReport } from '../../../../services/repository/ReportsRepo.js';
import {
  KpiCard, Loading, ErrorState, fmtMoney, fmtMoneyK,
  COLORS, Card, SectionTitle, PropertyStatusBadge,
} from '../utils/reportUtils.jsx';

const MODE_COLORS = { CASH: COLORS.primary, CHEQUE: COLORS.accent, UPI: COLORS.success };

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-3 py-2 text-xs space-y-0.5"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{fmtMoneyK(payload[0].value)}</p>
      <p style={{ color: 'var(--text-muted)' }}>{payload[0].payload.count} transactions</p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-3 py-2 text-xs space-y-0.5"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{label}</p>
      <p style={{ color: COLORS.primary }}>{fmtMoneyK(payload[0]?.value)}</p>
    </div>
  );
};

const MEDALS = ['🥇','🥈','🥉'];

export default function LifetimeReport() {
  const dispatch = useDispatch();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = () => {
    setLoading(true); setError(null);
    dispatch(getLifetimeReport()).then(r => {
      if (r) setData(r); else setError('Failed to load lifetime report.');
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <Loading label="Loading lifetime report..." />;
  if (error)   return <ErrorState msg={error} onRetry={fetch} />;
  if (!data)   return null;

  const { totals = {}, paymentModeBreakdown = [], topProperties = [] } = data;

  const pieFull = paymentModeBreakdown.map(r => ({
    name: r.mode, value: Number(r.totalAmount), count: r.count,
    fill: MODE_COLORS[r.mode] || COLORS.muted,
  }));

  const barData = topProperties.map(p => ({
    name: (p.property?.name || '').slice(0, 18),
    fullName: p.property?.name,
    Collected: Number(p.totalCollected),
    transactions: p.totalTransactions,
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard icon={IconTrendingUp} label="Total Collected"   value={fmtMoneyK(totals.totalRentCollected)}   color={COLORS.primary} sub={fmtMoney(totals.totalRentCollected)} />
        <KpiCard icon={IconReceipt}    label="Transactions"      value={totals.totalPaymentTransactions || 0}    color={COLORS.success} />
        <KpiCard icon={IconFileText}   label="Agreements"        value={totals.totalAgreements || 0}             color={COLORS.accent}  />
        <KpiCard icon={IconUsers}      label="Unique Tenants"    value={totals.totalUniqueTenants || 0}           color={COLORS.primary} />
        <KpiCard icon={IconBuilding}   label="Properties"        value={totals.totalProperties || 0}             color={COLORS.primary} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Mode Pie */}
        <Card>
          <div className="p-5">
            <SectionTitle>Payment Mode Breakdown</SectionTitle>
            {pieFull.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieFull} cx="50%" cy="50%" outerRadius={85}
                    dataKey="value" nameKey="name" labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent*100).toFixed(0)}%` : ''}>
                    {pieFull.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend formatter={(v, e) => (
                    <span className="text-xs" style={{ color: 'var(--text-main)' }}>
                      {v}: {fmtMoneyK(e.payload.value)} ({e.payload.count})
                    </span>
                  )} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No payment data</p>
              </div>
            )}
          </div>
        </Card>

        {/* Top Properties Bar */}
        <Card>
          <div className="p-5">
            <SectionTitle>Top Properties by Collection</SectionTitle>
            {barData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" horizontal={false} />
                  <XAxis type="number" tickFormatter={fmtMoneyK} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="Collected" fill={COLORS.primary} radius={[0,4,4,0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No property data</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Properties ranked cards */}
      {topProperties.length > 0 && (
        <Card>
          <div className="p-5">
            <SectionTitle>Top Properties Ranked</SectionTitle>
            <div className="space-y-3">
              {topProperties.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border"
                  style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <div className="text-2xl w-8 flex-shrink-0">{MEDALS[i] || `#${i+1}`}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{p.property?.name || '—'}</p>
                      {p.property?.status && <PropertyStatusBadge status={p.property.status} />}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.property?.address || ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold" style={{ color: COLORS.primary }}>{fmtMoneyK(p.totalCollected)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.totalTransactions} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}