// ─── Formatters ───────────────────────────────────────────────────────────────
export const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtMoney = (n) =>
  n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

export const fmtMoneyK = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toLocaleString('en-IN')}`;
};

export const fmtMonth = (s) => {
  if (!s) return '—';
  const [y, m] = s.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export const fmtMonthShort = (s) => {
  if (!s) return '—';
  const [y, m] = s.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short' });
};

export const daysUntil = (iso) => {
  if (!iso) return 0;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

export const daysSince = (iso) => {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
};

export const collectionRate = (collected, due) => {
  if (!due || Number(due) === 0) return 0;
  return Math.min(100, (Number(collected) / Number(due)) * 100);
};

export const calcAge = (dob) => {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000));
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export const KpiCard = ({ icon: Icon, label, value, color = 'var(--brand-primary)', sub }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border"
    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}22` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-lg font-bold truncate leading-tight" style={{ color: 'var(--text-main)' }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ pct, label, showPct = true }) => {
  const p = Math.min(100, Math.max(0, Number(pct) || 0));
  const color = p >= 90 ? 'var(--success)' : p >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      {(label || showPct) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span style={{ color: 'var(--text-muted)' }}>{label}</span>}
          {showPct && <span style={{ color }}>{Math.round(p)}%</span>}
        </div>
      )}
      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-border)' }}>
        <div className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${p}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

// ─── Status Badges ────────────────────────────────────────────────────────────
export const LedgerStatusBadge = ({ status }) => {
  const map = {
    PAID:    { bg: 'rgba(30,140,74,0.1)',    c: 'var(--success)' },
    PARTIAL: { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' },
    PENDING: { bg: 'rgba(100,100,100,0.1)', c: 'var(--text-muted)' },
    OVERDUE: { bg: 'rgba(217,48,37,0.1)',   c: 'var(--danger)' },
  };
  const cfg = map[status] || map.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.c }} />
      {status}
    </span>
  );
};

export const AgreementStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',    c: 'var(--success)' },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',   c: 'var(--danger)' },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>
  );
};

export const PropertyStatusBadge = ({ status }) => {
  const cfg = status === 'RENTED'
    ? { bg: 'rgba(30,140,74,0.1)', c: 'var(--success)' }
    : { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>{status}</span>
  );
};

// ─── Section Card ─────────────────────────────────────────────────────────────
export const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border ${className}`}
    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    {children}
  </div>
);

export const SectionTitle = ({ children, className = '' }) => (
  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${className}`}
    style={{ color: 'var(--text-muted)' }}>{children}</p>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────
export const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 py-1.5 border-b"
    style={{ borderColor: 'var(--surface-border)' }}>
    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-medium text-right" style={{ color: 'var(--text-main)' }}>{value}</span>
  </div>
);

// ─── Loading / Error / Empty ──────────────────────────────────────────────────
export const Loading = ({ label = 'Loading report...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </div>
);

export const ErrorState = ({ msg, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}>
      <span className="text-xl">⚠️</span>
    </div>
    <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{msg || 'Failed to load report.'}</p>
    {onRetry && (
      <button onClick={onRetry}
        className="text-sm px-4 py-2 rounded-lg border"
        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}>
        Retry
      </button>
    )}
  </div>
);

export const EmptyState = ({ msg = 'No data found.' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-2">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
      style={{ backgroundColor: 'var(--surface-bg)' }}>
      <span className="text-xl">📭</span>
    </div>
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{msg}</p>
  </div>
);

// ─── Fetch Button ─────────────────────────────────────────────────────────────
export const FetchButton = ({ onClick, loading, label = 'Fetch Report' }) => (
  <button onClick={onClick} disabled={loading}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 hover:opacity-85 transition-opacity"
    style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
    {loading
      ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
      : <span>↗</span>}
    {loading ? 'Loading...' : label}
  </button>
);

// ─── Select Input ─────────────────────────────────────────────────────────────
export const FilterSelect = ({ value, onChange, children, className = '' }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className={`px-3 py-2 rounded-lg border text-sm outline-none ${className}`}
    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
    {children}
  </select>
);

export const FilterInput = ({ type = 'number', value, onChange, min, max, placeholder, className = '' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)}
    min={min} max={max} placeholder={placeholder}
    className={`px-3 py-2 rounded-lg border text-sm outline-none w-24 ${className}`}
    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
);

// ─── Chart currency tooltip formatter ────────────────────────────────────────
export const chartMoneyFormatter = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

// ─── Chart colors ─────────────────────────────────────────────────────────────
export const COLORS = {
  primary:   '#1a6b3c',
  accent:    '#e8a020',
  success:   '#1e8c4a',
  danger:    '#d93025',
  warning:   '#e8a020',
  muted:     '#9ca3af',
  border:    '#d1fae5',
  light:     '#d1fae5',
};

export const LEDGER_STATUS_COLORS = {
  PAID:    COLORS.success,
  PARTIAL: COLORS.warning,
  PENDING: COLORS.muted,
  OVERDUE: COLORS.danger,
};

// ─── Donut center label helper ────────────────────────────────────────────────
export const DonutCenterLabel = ({ viewBox, line1, line2 }) => {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 14, fontWeight: 700, fill: 'var(--text-main)' }}>
        {line1}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 10, fill: 'var(--text-muted)' }}>
        {line2}
      </text>
    </>
  );
};