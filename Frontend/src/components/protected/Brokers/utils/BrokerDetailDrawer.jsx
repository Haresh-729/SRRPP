import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconX, IconEdit, IconPhone, IconMail, IconMapPin, IconBriefcase } from '@tabler/icons-react';
import { getBrokerById } from '../../../../services/repository/BrokerRepo.js';
import { selectAccount } from '../../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../../services/utils/rbac.js';

const fmt     = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const AgreementStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',   color: 'var(--success)' },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)', color: 'var(--warning)' },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',   color: 'var(--danger)' },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>{status}</span>
  );
};

const BrokerDetailDrawer = ({ isOpen, brokerId, onClose, onEdit }) => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [broker, setBroker]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('profile');

  useEffect(() => {
    if (!isOpen || !brokerId) return;
    setTab('profile');
    setLoading(true);
    dispatch(getBrokerById(brokerId)).then(res => { setBroker(res); setLoading(false); });
  }, [isOpen, brokerId]);

  useEffect(() => { if (!isOpen) setBroker(null); }, [isOpen]);

  if (!isOpen) return null;

  const name       = broker?.name       || '';
  const contactNo  = broker?.contact_no || broker?.contactNo || '';
  const email      = broker?.email      || '';
  const address    = broker?.address    || '';
  const isActive   = broker?.is_active  ?? broker?.isActive;
  const count      = broker?._count?.agreements ?? 0;
  const agreements = broker?.agreements || [];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            <IconBriefcase size={18} style={{ color: 'var(--brand-primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              {name || 'Broker Details'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && broker && (
              <button onClick={() => onEdit(broker)}
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
        <div className="flex border-b flex-shrink-0 px-5" style={{ borderColor: 'var(--surface-border)' }}>
          {['profile', 'agreements'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-3 text-xs font-semibold border-b-2 capitalize transition-colors mr-2"
              style={{
                borderColor: tab === t ? 'var(--brand-primary)' : 'transparent',
                color: tab === t ? 'var(--brand-primary)' : 'var(--text-muted)',
              }}>
              {t}
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
          ) : !broker ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load broker.</p>
          ) : (
            <>
              {/* ── TAB: Profile ── */}
              {tab === 'profile' && (
                <div className="space-y-4">
                  {/* Name + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text-main)' }}>{name}</h2>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Created {fmt(broker.created_at || broker.createdAt)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                      style={isActive
                        ? { backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }
                        : { backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isActive ? 'var(--success)' : 'var(--danger)' }} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="rounded-xl border p-4 space-y-3"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <div className="flex items-center gap-3">
                      <IconPhone size={15} style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-main)' }}>
                        +91 {contactNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IconMail size={15} style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: email ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {email || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <IconMapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
                      <span className="text-sm" style={{ color: address ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {address || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Agreements count */}
                  <div className="rounded-xl border p-4 flex items-center justify-between"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Total Agreements</span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
                      style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: 'var(--brand-primary)' }}>
                      {count}
                    </span>
                  </div>
                </div>
              )}

              {/* ── TAB: Agreements ── */}
              {tab === 'agreements' && (
                <div className="space-y-3">
                  {!agreements.length ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>
                      No agreements handled by this broker yet
                    </p>
                  ) : agreements.map(ag => {
                    const bp = ag.brokerage_payments;
                    const prop   = ag.properties;
                    const tenant = ag.tenants;
                    return (
                      <div key={ag.id} className="rounded-xl border p-4 space-y-3"
                        style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                          <AgreementStatusBadge status={ag.status} />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {fmt(ag.start_date || ag.startDate)} → {fmt(ag.end_date || ag.endDate)}
                          </span>
                        </div>

                        {/* Property */}
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                            {prop?.name || '—'}
                          </p>
                          {prop?.address && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{prop.address}</p>
                          )}
                        </div>

                        {/* Tenant */}
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Tenant: <span style={{ color: 'var(--text-main)' }}>{tenant?.full_name || '—'}</span>
                        </p>

                        {/* Rent */}
                        <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                          {fmtMoney(ag.monthly_rent || ag.monthlyRent)} / month
                        </p>

                        {/* Brokerage */}
                        {bp && (
                          <div className="pt-2 border-t space-y-1" style={{ borderColor: 'var(--surface-border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                              Brokerage
                            </p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <span style={{ color: 'var(--text-muted)' }}>Type</span>
                              <span style={{ color: 'var(--text-main)' }}>{bp.brokerage_type || '—'}</span>
                              <span style={{ color: 'var(--text-muted)' }}>Value</span>
                              <span style={{ color: 'var(--text-main)' }}>
                                {bp.brokerage_type === 'PERCENTAGE'
                                  ? `${bp.brokerage_value}%`
                                  : fmtMoney(bp.brokerage_value)}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                              <span style={{ color: 'var(--text-main)' }}>{fmtMoney(bp.brokerage_amount)}</span>
                              <span style={{ color: 'var(--text-muted)' }}>Paid</span>
                              <span>
                                {bp.is_paid
                                  ? <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                                      style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>Yes</span>
                                  : <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                                      style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>No</span>
                                }
                              </span>
                              {bp.is_paid && bp.paid_on && (
                                <>
                                  <span style={{ color: 'var(--text-muted)' }}>Paid On</span>
                                  <span style={{ color: 'var(--text-main)' }}>{fmt(bp.paid_on)}</span>
                                </>
                              )}
                              {bp.payment_mode && (
                                <>
                                  <span style={{ color: 'var(--text-muted)' }}>Payment Mode</span>
                                  <span style={{ color: 'var(--text-main)' }}>{bp.payment_mode}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BrokerDetailDrawer;