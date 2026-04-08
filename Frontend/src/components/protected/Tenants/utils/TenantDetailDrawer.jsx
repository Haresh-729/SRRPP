import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconX, IconEdit, IconMail, IconPhone, IconMapPin, IconUser } from '@tabler/icons-react';
import { getTenantById } from '../../../../services/repository/TenantRepo.js';
import { selectAccount } from '../../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../../services/utils/rbac.js';

const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n)   => n   != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const calcAge  = (dob) => { if (!dob) return null; return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000)); };

const AgreementStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',   c: 'var(--success)' },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)', c: 'var(--warning)' },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',   c: 'var(--danger)' },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.c }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.c }} />
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-medium text-right" style={{ color: 'var(--text-main)' }}>{value}</span>
  </div>
);

const DocThumb = ({ url, label }) => url
  ? (<a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt={label} className="w-full h-24 object-cover rounded-xl border hover:opacity-80 cursor-pointer"
        style={{ borderColor: 'var(--surface-border)' }} />
      <p className="text-xs mt-1 text-center" style={{ color: 'var(--brand-primary)' }}>View {label}</p>
    </a>)
  : (<div className="w-full h-24 rounded-xl border flex items-center justify-center"
      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Not uploaded</p>
    </div>);

const TenantDetailDrawer = ({ isOpen, tenantId, onClose, onEdit }) => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('profile');

  useEffect(() => {
    if (!isOpen || !tenantId) return;
    setTab('profile');
    setLoading(true);
    dispatch(getTenantById(tenantId)).then(r => { setTenant(r); setLoading(false); });
  }, [isOpen, tenantId]);

  useEffect(() => { if (!isOpen) setTenant(null); }, [isOpen]);

  if (!isOpen) return null;

  const fullName        = tenant?.fullName          || tenant?.full_name         || '';
  const email           = tenant?.email             || '';
  const whatsAppNo      = tenant?.whatsAppNo        || tenant?.whats_app_no      || '';
  const dob             = tenant?.dob               || '';
  const permanentAddress = tenant?.permanentAddress || tenant?.permanent_address || '';
  const isActive        = tenant?.isActive          ?? tenant?.is_active;
  const createdAt       = tenant?.createdAt         || tenant?.created_at;
  const aadharPhoto     = tenant?.aadharPhoto       || tenant?.aadhar_photo      || null;
  const panPhoto        = tenant?.panPhoto          || tenant?.pan_photo         || null;
  const agreements      = tenant?.agreements        || [];
  const _count          = tenant?._count            || {};

  const age = calcAge(dob);
  const activeAgreement = agreements.find(a => a.status === 'ACTIVE');

  // Compute payment summary from agreements
  const totalTransactions = _count.payments || 0;

  const TABS = [
    { key: 'profile',   label: 'Profile'   },
    { key: 'agreements', label: 'Agreements'},
    { key: 'payments',  label: 'Payment Summary' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            <IconUser size={18} style={{ color: 'var(--brand-primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              {fullName || 'Tenant Details'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && tenant && (
              <button onClick={() => onEdit(tenant)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                <IconEdit size={13} /> Edit
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0 px-5 overflow-x-auto" style={{ borderColor: 'var(--surface-border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-3 text-xs font-semibold border-b-2 transition-colors mr-2 whitespace-nowrap"
              style={{
                borderColor: tab === t.key ? 'var(--brand-primary)' : 'transparent',
                color:       tab === t.key ? 'var(--brand-primary)' : 'var(--text-muted)',
              }}>
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
          ) : !tenant ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load tenant.</p>
          ) : (
            <>
              {/* ── TAB: Profile ── */}
              {tab === 'profile' && (
                <div className="space-y-4">
                  {/* Name + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold" style={{ color: 'var(--text-main)' }}>{fullName}</h2>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Member since {fmt(createdAt)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={isActive
                        ? { backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }
                        : { backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? 'var(--success)' : 'var(--danger)' }} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Personal Info */}
                  <div className="rounded-2xl border p-4 space-y-3"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <div className="flex items-center gap-3">
                      <IconMail size={15} style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: email ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {email || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IconPhone size={15} style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                        +91 {whatsAppNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IconUser size={15} style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                        {fmt(dob)}{age ? ` (${age} yrs)` : ''}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <IconMapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: permanentAddress ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {permanentAddress || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3 text-center"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <p className="text-xl font-extrabold" style={{ color: 'var(--brand-primary)' }}>
                        {_count.agreements ?? agreements.length}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Agreements</p>
                    </div>
                    <div className="rounded-xl border p-3 text-center"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <p className="text-xl font-extrabold" style={{ color: 'var(--success)' }}>{totalTransactions}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Payments</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                      KYC Documents
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Aadhar Card</p>
                        <DocThumb url={aadharPhoto} label="Aadhar" />
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>PAN Card</p>
                        <DocThumb url={panPhoto} label="PAN" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: Agreements ── */}
              {tab === 'agreements' && (
                <div className="space-y-3">
                  {!agreements.length ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No agreements yet</p>
                  ) : agreements.map(ag => (
                    <div key={ag.id} className="rounded-2xl border p-4"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <AgreementStatusBadge status={ag.status} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {fmt(ag.startDate || ag.start_date)} → {fmt(ag.endDate || ag.end_date)}
                        </span>
                      </div>
                      <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-main)' }}>
                        {ag.property?.name || '—'}
                      </p>
                      {ag.property?.address && (
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{ag.property.address}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>
                          Rent: <span className="font-semibold" style={{ color: 'var(--brand-primary)' }}>
                            {fmtMoney(ag.monthlyRent || ag.monthly_rent)}
                          </span>/mo
                        </span>
                        {ag.durationMonths && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Duration: <span style={{ color: 'var(--text-main)' }}>{ag.durationMonths} months</span>
                          </span>
                        )}
                        {ag.broker?.name && (
                          <span style={{ color: 'var(--text-muted)' }}>
                            Broker: <span style={{ color: 'var(--text-main)' }}>{ag.broker.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Payment Summary ── */}
              {tab === 'payments' && (
                <div className="space-y-4">
                  {/* Lifetime totals */}
                  <div className="rounded-2xl border p-4"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                      Lifetime Summary
                    </p>
                    <InfoRow label="Total Agreements"   value={_count.agreements ?? agreements.length} />
                    <InfoRow label="Total Transactions" value={totalTransactions} />
                  </div>

                  {/* Active agreement financials */}
                  {activeAgreement ? (
                    <div className="rounded-2xl border p-4"
                      style={{ borderColor: 'rgba(30,140,74,0.3)', backgroundColor: 'rgba(30,140,74,0.04)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <AgreementStatusBadge status="ACTIVE" />
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                          {activeAgreement.property?.name || 'Current Agreement'}
                        </p>
                      </div>
                      <InfoRow label="Monthly Rent" value={fmtMoney(activeAgreement.monthlyRent || activeAgreement.monthly_rent)} />
                      <InfoRow label="Start Date"   value={fmt(activeAgreement.startDate || activeAgreement.start_date)} />
                      <InfoRow label="End Date"     value={fmt(activeAgreement.endDate   || activeAgreement.end_date)} />
                    </div>
                  ) : (
                    <div className="rounded-xl border p-4 text-center"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        No active agreement currently. View the Reports module for detailed payment analytics.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TenantDetailDrawer;