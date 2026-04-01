import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  IconBuilding, IconCheck, IconClock, IconFileText,
  IconTrendingUp, IconAlertCircle, IconAlertTriangle,
} from '@tabler/icons-react';
import { getPortfolioReport } from '../../../../services/repository/ReportsRepo.js';
import {
  KpiCard, Loading, ErrorState, fmtMoney, fmtMoneyK,
  collectionRate, COLORS, DonutCenterLabel,
} from '../utils/reportUtils.jsx';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * RADIAN)} y={cy + r * Math.sin(-midAngle * RADIAN)}
      textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 600, fill: '#fff' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-xl px-3 py-2 text-xs"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.color }}>{fmtMoneyK(payload[0].value)}</p>
    </div>
  );
};

export default function PortfolioReport() {
  const dispatch = useDispatch();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = () => {
    setLoading(true); setError(null);
    dispatch(getPortfolioReport()).then(r => {
      if (r) setData(r); else setError('Failed to load portfolio data.');
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <Loading label="Loading portfolio overview..." />;
  if (error)   return <ErrorState msg={error} onRetry={fetch} />;
  if (!data)   return null;

  const {
    totalProperties = 0, rentedProperties = 0, vacantProperties = 0,
    activeAgreements = 0, totalRentCollected = 0,
    totalPendingBalance = 0, overdueCount = 0,
  } = data;

  const occupancy = totalProperties > 0 ? ((rentedProperties / totalProperties) * 100).toFixed(1) : 0;

  const propertyPie = [
    { name: 'Rented', value: rentedProperties,   color: COLORS.primary },
    { name: 'Vacant', value: vacantProperties,   color: COLORS.accent  },
  ];

  const financePie = [
    { name: 'Collected', value: Number(totalRentCollected),   color: COLORS.success  },
    { name: 'Pending',   value: Number(totalPendingBalance),  color: COLORS.warning  },
  ];

  const totalFinance = Number(totalRentCollected) + Number(totalPendingBalance);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <KpiCard icon={IconBuilding}       label="Total Properties"  value={totalProperties}    color={COLORS.primary} />
        <KpiCard icon={IconCheck}          label="Rented"            value={rentedProperties}   color={COLORS.success} />
        <KpiCard icon={IconClock}          label="Vacant"            value={vacantProperties}   color={COLORS.accent}  />
        <KpiCard icon={IconFileText}       label="Active Agreements" value={activeAgreements}   color={COLORS.primary} />
        <KpiCard icon={IconTrendingUp}     label="Total Collected"   value={fmtMoneyK(totalRentCollected)} color={COLORS.success} />
        <KpiCard icon={IconAlertCircle}    label="Pending Balance"   value={fmtMoneyK(totalPendingBalance)} color={COLORS.warning} />
        <KpiCard icon={IconAlertTriangle}  label="Overdue Accounts"  value={overdueCount}       color={overdueCount > 0 ? COLORS.danger : COLORS.success} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Property Status donut */}
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Property Status</p>
          {totalProperties > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={propertyPie} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {propertyPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 20, fontWeight: 800, fill: 'var(--text-main)' }}>
                    {totalProperties}
                  </text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 10, fill: 'var(--text-muted)' }}>
                    Properties
                  </text>
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v, e) => (
                  <span className="text-xs" style={{ color: 'var(--text-main)' }}>{v}: {e.payload.value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No property data</p>
            </div>
          )}
        </div>

        {/* Financial Overview donut */}
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-main)' }}>Financial Overview</p>
          {totalFinance > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={financePie} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {financePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                  <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 13, fontWeight: 800, fill: 'var(--text-main)' }}>
                    {fmtMoneyK(totalFinance)}
                  </text>
                  <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: 10, fill: 'var(--text-muted)' }}>
                    Total
                  </text>
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v, e) => (
                  <span className="text-xs" style={{ color: 'var(--text-main)' }}>{v}: {fmtMoneyK(e.payload.value)}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No financial data</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary text cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Occupancy Rate</p>
          <p className="text-3xl font-extrabold" style={{ color: COLORS.primary }}>{occupancy}%</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {rentedProperties} of {totalProperties} properties rented
          </p>
          <div className="mt-3 w-full h-2 rounded-full" style={{ backgroundColor: 'var(--surface-border)' }}>
            <div className="h-2 rounded-full" style={{ width: `${occupancy}%`, backgroundColor: COLORS.primary }} />
          </div>
        </div>
        <div className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Overdue Accounts</p>
          <p className="text-3xl font-extrabold"
            style={{ color: overdueCount > 0 ? COLORS.danger : COLORS.success }}>
            {overdueCount}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {overdueCount > 0 ? 'ledgers with outstanding overdue balance' : 'All payments up to date ✓'}
          </p>
          <div className="mt-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total collected: <span className="font-semibold" style={{ color: COLORS.success }}>{fmtMoney(totalRentCollected)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}