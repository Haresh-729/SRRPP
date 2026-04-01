import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  IconBuilding, IconCheck, IconClock, IconFileText, IconAlertTriangle,
  IconAlertCircle, IconCurrencyRupee, IconRefresh, IconCalendar,
  IconReceipt, IconArrowRight, IconBuildingBank,
} from '@tabler/icons-react';
import { getDashboard } from '../../../services/repository/DashboardRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';

// ─── Formatters ────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtMoney = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const fmtMoneyShort = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString('en-IN')}`;
};

const fmtMonth = (s) => {
  if (!s) return '—';
  const [y, m] = s.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const daysUntil = (iso) => {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
};

const timeAgo = (ms) => {
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg ${className}`}
    style={{ backgroundColor: 'var(--surface-border)' }} />
);

const SkCard = () => (
  <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    <div className="flex items-center gap-3 mb-3">
      <Sk className="w-10 h-10 rounded-xl" />
      <Sk className="h-4 w-24" />
    </div>
    <Sk className="h-8 w-16 mb-2" />
    <Sk className="h-3 w-32" />
  </div>
);

const SkeletonDashboard = () => (
  <div className="p-6 md:p-8 space-y-8">
    <div className="flex justify-between items-start">
      <div className="space-y-2"><Sk className="h-8 w-32" /><Sk className="h-4 w-48" /></div>
      <Sk className="h-9 w-28 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(7)].map((_, i) => <SkCard key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 space-y-3">
        <Sk className="h-6 w-40" />
        <Sk className="h-40 w-full rounded-2xl" />
      </div>
      <div className="lg:col-span-2"><Sk className="h-52 w-full rounded-2xl" /></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Sk className="h-64 rounded-2xl" />
      <Sk className="h-64 rounded-2xl" />
    </div>
    <Sk className="h-48 rounded-2xl" />
    <Sk className="h-64 rounded-2xl" />
    <Sk className="h-64 rounded-2xl" />
  </div>
);

// ─── Sub-components ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, countColor, link, linkLabel = 'View All →', navigate }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{title}</h2>
      {count != null && (
        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: `${countColor || 'var(--brand-primary)'}18`, color: countColor || 'var(--brand-primary)' }}>
          {count}
        </span>
      )}
    </div>
    {link && (
      <button onClick={() => navigate(link)}
        className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--brand-primary)' }}>
        {linkLabel} <IconArrowRight size={12} />
      </button>
    )}
  </div>
);

const EmptyCard = ({ icon: Icon, msg, positive }) => (
  <div className="rounded-2xl border p-6 flex flex-col items-center justify-center gap-3 text-center"
    style={{
      backgroundColor: positive ? 'rgba(30,140,74,0.04)' : 'var(--surface-card)',
      borderColor: positive ? 'rgba(30,140,74,0.2)' : 'var(--surface-border)',
    }}>
    {Icon && <Icon size={28} style={{ color: positive ? 'var(--success)' : 'var(--text-muted)' }} />}
    <p className="text-sm" style={{ color: positive ? 'var(--success)' : 'var(--text-muted)' }}>{msg}</p>
  </div>
);

const LedgerStatusBadge = ({ status }) => {
  const map = {
    PAID:    { bg: 'rgba(30,140,74,0.1)',    c: 'var(--success)' },
    PARTIAL: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' },
    PENDING: { bg: 'rgba(100,100,100,0.1)', c: 'var(--text-muted)' },
    OVERDUE: { bg: 'rgba(217,48,37,0.1)',   c: 'var(--danger)' },
  };
  const cfg = map[status] || map.PENDING;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.c }} />
      {status}
    </span>
  );
};

const AgreementStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',   c: 'var(--success)'  },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)'  },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',   c: 'var(--danger)'   },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl px-3 py-2 text-xs space-y-1"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
      <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }}>{p.name}: {fmtMoney(p.value)}</p>
      ))}
    </div>
  );
};

// Circular SVG progress for collection rate
const CollectionRing = ({ rate }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = ((rate || 0) / 100) * circ;
  const color = rate >= 90 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={128} height={128} viewBox="0 0 128 128">
          <circle cx={64} cy={64} r={r} fill="none" strokeWidth={12}
            stroke="var(--surface-border)" />
          <circle cx={64} cy={64} r={r} fill="none" strokeWidth={12}
            stroke={rate > 0 ? color : 'var(--surface-border)'}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeLinecap="round"
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color: rate > 0 ? color : 'var(--text-muted)' }}>
            {Math.round(rate || 0)}%
          </span>
          {rate >= 100 && <span className="text-[10px] font-bold" style={{ color: 'var(--success)' }}>✓</span>}
        </div>
      </div>
      <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>
        {rate >= 100 ? 'Fully Collected ✓' : rate === 0 ? 'No collections yet' : 'Collection Rate'}
      </p>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const account     = useSelector(selectAccount);
  const userName    = account?.uname || account?.name || 'User';

  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('');

  const autoRefreshRef = useRef(null);
  const labelRef       = useRef(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else { setLoading(true); setError(null); }
    const result = await dispatch(getDashboard());
    if (result) {
      setData(result);
      setLastUpdated(Date.now());
      setLastUpdatedLabel('Just now');
    } else {
      if (!isRefresh) setError('Failed to load dashboard data.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    fetchData(false);
    autoRefreshRef.current = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => {
      clearInterval(autoRefreshRef.current);
      clearInterval(labelRef.current);
    };
  }, [fetchData]);

  useEffect(() => {
    if (!lastUpdated) return;
    labelRef.current = setInterval(() => {
      setLastUpdatedLabel(timeAgo(lastUpdated));
    }, 60000);
    return () => clearInterval(labelRef.current);
  }, [lastUpdated]);

  if (loading) return <SkeletonDashboard />;

  if (error) return (
    <div className="p-8 flex items-center justify-center">
      <div className="rounded-2xl border p-8 flex flex-col items-center gap-4 text-center max-w-sm w-full"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}>
          <IconAlertTriangle size={24} style={{ color: 'var(--danger)' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Failed to load dashboard data</p>
        <button onClick={() => fetchData(false)}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
          Retry
        </button>
      </div>
    </div>
  );

  const { snapshot = {}, currentMonth = {}, upcomingDues = [], expiringAgreements = [], recentPayments = [], rentedProperties = [], vacantProperties = [] } = data || {};

  // ── Current Month Chart data ──
  const chartData = [{
    name: fmtMonth(currentMonth.ledgerMonth)?.split(' ')[0] || 'Month',
    Expected: Number(currentMonth.totalExpected || 0),
    Collected: Number(currentMonth.totalCollected || 0),
  }];

  return (
    <div className="min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>
      {/* Top refresh progress bar */}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5" style={{ backgroundColor: 'var(--surface-border)' }}>
          <div className="h-full w-1/2 animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }} />
        </div>
      )}

      <div className="p-6 md:p-8 space-y-8 max-w-screen-2xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: 'var(--text-main)' }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {greeting()}, <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{userName}</span> 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Last updated: {lastUpdatedLabel || 'Just now'}
              </p>
            )}
            <button onClick={() => fetchData(true)} disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60 hover:opacity-85"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
              <IconRefresh size={15} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* ── ROW 1 — SNAPSHOT KPI CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Card 1 — Total Properties */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(26,107,60,0.1)' }}>
                <IconBuilding size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Properties</p>
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>
              {snapshot.totalProperties ?? 0}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {snapshot.rentedProperties} rented, {snapshot.vacantProperties} vacant
            </p>
          </div>

          {/* Card 2 — Rented */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(30,140,74,0.1)' }}>
                <IconCheck size={18} style={{ color: 'var(--success)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rented</p>
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>
              {snapshot.rentedProperties ?? 0}
            </p>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              out of {snapshot.totalProperties ?? 0} properties
            </p>
            {snapshot.totalProperties > 0 && (
              <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-border)' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${((snapshot.rentedProperties || 0) / snapshot.totalProperties) * 100}%`, backgroundColor: 'var(--success)' }} />
              </div>
            )}
          </div>

          {/* Card 3 — Vacant */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: snapshot.vacantProperties > 0 ? 'rgba(232,160,32,0.4)' : 'var(--surface-border)',
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: snapshot.vacantProperties > 0 ? 'rgba(232,160,32,0.1)' : 'var(--surface-bg)' }}>
                <IconClock size={18} style={{ color: snapshot.vacantProperties > 0 ? 'var(--warning)' : 'var(--text-muted)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Vacant</p>
            </div>
            <p className="text-3xl font-extrabold mb-1"
              style={{ color: snapshot.vacantProperties > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
              {snapshot.vacantProperties ?? 0}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {snapshot.vacantProperties > 0 ? 'Needs attention' : 'Fully occupied'}
            </p>
          </div>

          {/* Card 4 — Active Agreements */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(26,107,60,0.1)' }}>
                <IconFileText size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active Agreements</p>
            </div>
            <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-main)' }}>
              {snapshot.activeAgreements ?? 0}
            </p>
          </div>

          {/* Card 5 — Expiring Soon */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: snapshot.expiringIn30Days > 0 ? 'rgba(217,48,37,0.35)' : 'var(--surface-border)',
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: snapshot.expiringIn30Days > 0 ? 'rgba(217,48,37,0.1)' : 'var(--surface-bg)' }}>
                <IconAlertTriangle size={18} style={{ color: snapshot.expiringIn30Days > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Expiring in 30 Days</p>
            </div>
            <p className="text-3xl font-extrabold mb-1"
              style={{ color: snapshot.expiringIn30Days > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
              {snapshot.expiringIn30Days ?? 0}
            </p>
          </div>

          {/* Card 6 — Overdue Count */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: snapshot.overdueCount > 0 ? 'rgba(217,48,37,0.35)' : 'var(--surface-border)',
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: snapshot.overdueCount > 0 ? 'rgba(217,48,37,0.1)' : 'rgba(30,140,74,0.1)' }}>
                <IconAlertCircle size={18} style={{ color: snapshot.overdueCount > 0 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Overdue Ledgers</p>
            </div>
            <p className="text-3xl font-extrabold mb-1"
              style={{ color: snapshot.overdueCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {snapshot.overdueCount ?? 0}
            </p>
          </div>

          {/* Card 7 — Overdue Amount */}
          <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow cursor-default"
            style={{
              backgroundColor: 'var(--surface-card)',
              borderColor: snapshot.overdueAmount > 0 ? 'rgba(217,48,37,0.35)' : 'var(--surface-border)',
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: snapshot.overdueAmount > 0 ? 'rgba(217,48,37,0.1)' : 'rgba(30,140,74,0.1)' }}>
                <IconCurrencyRupee size={18} style={{ color: snapshot.overdueAmount > 0 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Overdue Amount</p>
            </div>
            <p className="text-2xl font-extrabold mb-1"
              style={{ color: snapshot.overdueAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {fmtMoneyShort(snapshot.overdueAmount)}
            </p>
          </div>
        </div>

        {/* ── ROW 2 — CURRENT MONTH + CHART ── */}
        <div className="space-y-3">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>
            Current Month —{' '}
            <span style={{ color: 'var(--brand-primary)' }}>
              {fmtMonth(currentMonth.ledgerMonth)}
            </span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left — KPI + ring + breakdown */}
            <div className="lg:col-span-3 rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
              {/* KPI strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Expected',      value: fmtMoneyShort(currentMonth.totalExpected),      color: 'var(--text-main)' },
                  { label: 'Collected',     value: fmtMoneyShort(currentMonth.totalCollected),     color: 'var(--success)'   },
                  { label: 'Outstanding',   value: fmtMoneyShort(currentMonth.totalOutstanding),   color: currentMonth.totalOutstanding > 0 ? 'var(--danger)' : 'var(--text-muted)' },
                  { label: 'Ledgers',       value: currentMonth.totalLedgers ?? 0,                  color: 'var(--text-main)' },
                  { label: 'Transactions',  value: currentMonth.collectionTransactions ?? 0,        color: 'var(--text-main)' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3 border"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="text-lg font-extrabold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Ring + Status breakdown */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Donut */}
                <div className="flex-shrink-0 self-center">
                  <CollectionRing rate={Number(currentMonth.collectionRate || 0)} />
                </div>

                {/* Status breakdown */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                    Status Breakdown
                  </p>
                  {Object.keys(currentMonth.statusBreakdown || {}).length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No ledgers for this month yet</p>
                  ) : (
                    <div className="space-y-2">
                      {['PAID','PARTIAL','PENDING','OVERDUE'].map(s => {
                        const d = (currentMonth.statusBreakdown || {})[s];
                        if (!d) return null;
                        return (
                          <div key={s} className="flex items-center gap-3 text-xs">
                            <LedgerStatusBadge status={s} />
                            <span style={{ color: 'var(--text-muted)' }}>{d.count} ledger{d.count !== 1 ? 's' : ''}</span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--text-main)' }}>{fmtMoneyShort(d.totalDue)} due</span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--success)' }}>{fmtMoneyShort(d.paidAmount)} paid</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right — Bar chart */}
            <div className="lg:col-span-2 rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
                Expected vs Collected
              </p>
              {Number(currentMonth.totalExpected || 0) === 0 && Number(currentMonth.totalCollected || 0) === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No ledgers for this month</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={48} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="Expected"  name="Expected"  fill="var(--surface-border)" radius={[4,4,0,0]} barSize={40} />
                    <Bar dataKey="Collected" name="Collected" fill="var(--brand-primary)"   radius={[4,4,0,0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── ROW 3 — UPCOMING DUES + RECENT PAYMENTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Dues */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <SectionHeader title="Upcoming Dues" count={upcomingDues.length}
              countColor="var(--warning)" navigate={navigate} />
            {!upcomingDues.length ? (
              <EmptyCard icon={IconCalendar} msg="No dues in the next 7 days" positive />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {upcomingDues.map(item => {
                  const days = daysUntil(item.dueDate);
                  const dueBadgeColor = days === 0 ? 'var(--danger)' : days === 1 ? 'var(--warning)' : 'var(--accent)';
                  const dueBadgeBg   = days === 0 ? 'rgba(217,48,37,0.1)' : days === 1 ? 'rgba(232,160,32,0.12)' : 'rgba(232,160,32,0.08)';
                  const dueLabel     = days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `Due in ${days} days`;
                  return (
                    <div key={item.ledgerId} className="rounded-xl border p-4"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <LedgerStatusBadge status={item.status} />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: dueBadgeBg, color: dueBadgeColor }}>
                          {dueLabel}
                        </span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{item.property?.name || '—'}</p>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {item.tenant?.full_name || '—'}
                        {item.tenant?.whats_app_no ? ` · +91 ${item.tenant.whats_app_no}` : ''}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>
                          Month: <span style={{ color: 'var(--text-main)' }}>
                            {item.ledgerMonth ? (() => { const [y,m]=item.ledgerMonth.split('-'); return new Date(y,m-1).toLocaleDateString('en-IN',{month:'short',year:'numeric'}); })() : '—'}
                          </span>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Due: <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(item.totalDue)}</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Balance: <span className="font-semibold" style={{ color: Number(item.balanceCarried) > 0 ? 'var(--danger)' : 'var(--success)' }}>
                            {fmtMoney(item.balanceCarried)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
            <SectionHeader title="Recent Payments" navigate={navigate}
              link="/payments" linkLabel="View All →" />
            {!recentPayments.length ? (
              <EmptyCard icon={IconReceipt} msg="No payments recorded yet" />
            ) : (
              <div className="space-y-3">
                {recentPayments.map(p => {
                  const modeCfg = {
                    CASH:   { bg: 'rgba(26,107,60,0.1)',    c: 'var(--brand-primary)' },
                    CHEQUE: { bg: 'rgba(232,160,32,0.12)', c: 'var(--accent)'        },
                    UPI:    { bg: 'rgba(30,140,74,0.1)',    c: 'var(--success)'       },
                  };
                  const mc = modeCfg[p.paymentMode] || modeCfg.CASH;
                  const lc = { PAID: 'var(--success)', PARTIAL: 'var(--warning)', PENDING: 'var(--text-muted)', OVERDUE: 'var(--danger)' };
                  const lIcon = { PAID: '✓', PARTIAL: '◑', PENDING: '○', OVERDUE: '!' };
                  return (
                    <div key={p.id} className="flex items-start gap-3 rounded-xl border p-4"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: mc.bg, color: mc.c }}>{p.paymentMode}</span>
                          {p.isAdvance && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Advance</span>
                          )}
                        </div>
                        <p className="text-base font-extrabold" style={{ color: 'var(--brand-primary)' }}>
                          {fmtMoney(p.amount)}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {p.tenant?.full_name || '—'} — {p.property?.name || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          For:{' '}
                          {p.ledger?.ledger_month ? (() => { const [y,m]=p.ledger.ledger_month.split('-'); return new Date(y,m-1).toLocaleDateString('en-IN',{month:'short',year:'numeric'}); })() : '—'}
                          {' · '}Received: {fmt(p.receivedOn)}
                        </p>
                      </div>
                      {p.ledger?.status && (
                        <span className="text-base font-bold flex-shrink-0" style={{ color: lc[p.ledger.status] }}>
                          {lIcon[p.ledger.status] || '○'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 4 — EXPIRING AGREEMENTS ── */}
        <div>
          <SectionHeader title="Agreements Expiring Soon"
            count={expiringAgreements.length}
            countColor={expiringAgreements.length > 0 ? 'var(--danger)' : undefined}
            link="/reports" linkLabel="View All →" navigate={navigate} />
          {!expiringAgreements.length ? (
            <EmptyCard msg="✓ No agreements expiring in the next 30 days" positive />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
              {expiringAgreements.map(ag => {
                const days = ag.daysRemaining ?? daysUntil(ag.endDate);
                const urgColor = days <= 7 ? 'var(--danger)' : days <= 30 ? 'var(--warning)' : 'var(--accent)';
                const urgBg    = days <= 7 ? 'rgba(217,48,37,0.1)' : days <= 30 ? 'rgba(232,160,32,0.12)' : 'rgba(232,160,32,0.06)';
                return (
                  <div key={ag.id} className="flex-shrink-0 w-72 rounded-2xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-card)', borderLeft: `4px solid ${urgColor}`, borderColor: 'var(--surface-border)', borderLeftColor: urgColor }}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: 'var(--text-main)' }}>{ag.property?.name || '—'}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{ag.property?.address || ''}</p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-full"
                          style={{ backgroundColor: urgBg, color: urgColor }}>
                          ⏰ {days <= 0 ? 'Expired' : `${days}d left`}
                        </span>
                      </div>
                      <div className="rounded-lg p-2 mb-3" style={{ backgroundColor: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{ag.tenant?.full_name || '—'}</p>
                        {ag.tenant?.whats_app_no && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {ag.tenant.whats_app_no}</p>
                        )}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Start:</span>
                          <span style={{ color: 'var(--text-main)' }}>{fmt(ag.startDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>End:</span>
                          <span className="font-semibold" style={{ color: urgColor }}>{fmt(ag.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Rent:</span>
                          <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(ag.monthlyRent)}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ROW 5 — RENTED PROPERTIES ── */}
        <div>
          <SectionHeader
            title={`Rented Properties (${rentedProperties.length})`}
            link="/properties" linkLabel="View All →" navigate={navigate} />
          {!rentedProperties.length ? (
            <EmptyCard icon={IconBuildingBank} msg="No properties are currently rented" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rentedProperties.map(prop => {
                const ag = prop.agreement;
                return (
                  <div key={prop.id} className="rounded-2xl border overflow-hidden flex flex-col"
                    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                    {/* Header */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>RENTED</span>
                        {prop.propertyType?.name && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border"
                            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>
                            {prop.propertyType.name}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{prop.name}</p>
                      <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{prop.address}</p>
                      {prop.areaSqFt && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {Number(prop.areaSqFt).toLocaleString('en-IN')} sq.ft.
                        </p>
                      )}
                    </div>

                    {/* Tenant */}
                    {ag?.tenant && (
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Tenant</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{ag.tenant.full_name}</p>
                        <div className="flex flex-wrap gap-3 mt-0.5">
                          {ag.tenant.email && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>✉ {ag.tenant.email}</p>}
                          {ag.tenant.whats_app_no && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>📱 +91 {ag.tenant.whats_app_no}</p>}
                        </div>
                      </div>
                    )}

                    {/* Agreement */}
                    {ag && (
                      <div className="px-4 py-3 border-b flex-1" style={{ borderColor: 'var(--surface-border)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Agreement</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Rent</span>
                            <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(ag.monthlyRent)}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Due</span>
                            <span style={{ color: 'var(--text-main)' }}>{ag.rentDueDay}th of every month</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Period</span>
                            <span style={{ color: 'var(--text-main)' }}>{fmt(ag.startDate)} → {fmt(ag.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                            <span style={{ color: 'var(--text-main)' }}>{ag.durationMonths} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Deposit</span>
                            <span style={{ color: 'var(--text-main)' }}>{fmtMoney(ag.depositAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-muted)' }}>Deposit Status</span>
                            {ag.deposit ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>Received ✓</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Pending</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Broker</span>
                            <span style={{ color: ag.broker ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {ag.broker?.name || 'No broker'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex gap-2 px-4 py-3">
                      {ag?.id && (
                        <button onClick={() => navigate('/agreements')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-colors"
                          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <IconFileText size={12} /> Agreement
                        </button>
                      )}
                      <button onClick={() => navigate('/properties')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-colors"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconBuildingBank size={12} /> Property
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ROW 6 — VACANT PROPERTIES ── */}
        <div>
          <SectionHeader
            title={`Vacant Properties (${vacantProperties.length})`}
            link="/properties" linkLabel="View All →" navigate={navigate} />
          {!vacantProperties.length ? (
            <EmptyCard msg="✓ All properties are currently occupied" positive />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vacantProperties.map(prop => (
                <div key={prop.id} className="rounded-2xl border overflow-hidden flex flex-col"
                  style={{ backgroundColor: 'var(--surface-card)', borderLeft: '4px solid var(--warning)', borderColor: 'var(--surface-border)', borderLeftColor: 'var(--warning)' }}>
                  {/* Header */}
                  <div className="p-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>VACANT</span>
                      {prop.propertyType?.name && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border"
                          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>
                          {prop.propertyType.name}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{prop.name}</p>
                    <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{prop.address}</p>
                    {prop.areaSqFt && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {Number(prop.areaSqFt).toLocaleString('en-IN')} sq.ft.
                      </p>
                    )}
                  </div>

                  {/* Last agreement */}
                  <div className="px-4 py-3 flex-1" style={{ backgroundColor: 'var(--surface-bg)' }}>
                    {prop.lastAgreement ? (
                      <div className="space-y-1 text-xs">
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                          Previously rented to
                        </p>
                        <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {prop.lastAgreement.lastTenant?.full_name || '—'}
                        </p>
                        <p style={{ color: 'var(--text-muted)' }}>
                          Until: {fmt(prop.lastAgreement.endDate)}
                        </p>
                        <AgreementStatusBadge status={prop.lastAgreement.status} />
                      </div>
                    ) : (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Never rented</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex gap-2 px-4 py-3">
                    <button onClick={() => navigate('/agreements')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                      style={{ backgroundColor: 'rgba(26,107,60,0.08)', color: 'var(--brand-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.08)')}>
                      + Create Agreement
                    </button>
                    <button onClick={() => navigate('/properties')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-colors"
                      style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <IconBuildingBank size={12} /> Property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;