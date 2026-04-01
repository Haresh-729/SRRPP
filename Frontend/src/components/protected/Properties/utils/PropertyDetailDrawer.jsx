import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconX, IconFileText, IconEdit, IconBuildingSkyscraper } from '@tabler/icons-react';
import { getPropertyById } from '../../../../services/repository/PropertyRepo.js';
import { selectAccount } from '../../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../../services/utils/rbac.js';

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtArea  = (n) => n != null ? `${Number(n).toLocaleString('en-IN')} sq.ft.` : '—';

const StatusBadge = ({ status }) => {
  const cfg = status === 'RENTED'
    ? { bg: 'rgba(30,140,74,0.1)', color: 'var(--success)', label: 'Rented' }
    : { bg: 'rgba(232,160,32,0.12)', color: 'var(--warning)', label: 'Vacant' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
};

const AgreementStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',    color: 'var(--success)' },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)',  color: 'var(--warning)' },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',    color: 'var(--danger)'  },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b" style={{ borderColor: 'var(--surface-border)' }}>
    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-medium text-right" style={{ color: 'var(--text-main)' }}>{value}</span>
  </div>
);

const PropertyDetailDrawer = ({ isOpen, propertyId, onClose, onEdit }) => {
  const dispatch   = useDispatch();
  const account    = useSelector(selectAccount);
  const isAdmin    = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [property, setProperty] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState('overview');

  useEffect(() => {
    if (!isOpen || !propertyId) return;
    setTab('overview');
    setLoading(true);
    dispatch(getPropertyById(propertyId)).then(res => {
      setProperty(res);
      setLoading(false);
    });
  }, [isOpen, propertyId]);

  useEffect(() => { if (!isOpen) setProperty(null); }, [isOpen]);

  if (!isOpen) return null;

  const activeAgreement = property?.agreements?.find(a => a.status === 'ACTIVE');
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'agreements', label: 'Agreements' },
    ...(property?.status === 'RENTED' ? [{ key: 'current', label: 'Current Agreement' }] : []),
  ];

  const pdfUrl = property?.purchaseAgreementPdf || property?.purchase_agreement_pdf;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', borderLeft: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-2">
            <IconBuildingSkyscraper size={18} style={{ color: 'var(--brand-primary)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>
              {property?.name || 'Property Details'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && property && (
              <button onClick={() => onEdit(property)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                <IconEdit size={13} /> Edit
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: 'var(--text-muted)' }}>
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0 px-5" style={{ borderColor: 'var(--surface-border)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-3 text-xs font-semibold border-b-2 transition-colors mr-2"
              style={{
                borderColor:  tab === t.key ? 'var(--brand-primary)' : 'transparent',
                color: tab === t.key ? 'var(--brand-primary)' : 'var(--text-muted)',
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
          ) : !property ? (
            <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>Failed to load property.</p>
          ) : (
            <>
              {/* ── TAB: Overview ── */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  {/* Status row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={property.status} />
                    {property.propertyType?.name && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                        {property.propertyType.name}
                      </span>
                    )}
                    {!property.isActive && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'rgba(217,48,37,0.08)', color: 'var(--danger)' }}>Inactive</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <InfoRow label="Address"         value={property.address || '—'} />
                    <InfoRow label="Area"             value={fmtArea(property.areaSqFt)} />
                    <InfoRow label="Purchase Date"    value={fmt(property.purchaseDate)} />
                    <InfoRow label="Purchase Amount"  value={fmtMoney(property.purchaseAmount)} />
                    <InfoRow label="Created"          value={fmt(property.createdAt)} />
                  </div>

                  {/* PDF */}
                  <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>PURCHASE AGREEMENT</p>
                    {pdfUrl ? (
                      <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                        style={{ backgroundColor: 'rgba(26,107,60,0.08)', color: 'var(--brand-primary)' }}>
                        <IconFileText size={15} /> View Agreement PDF
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No PDF uploaded</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: Agreements ── */}
              {tab === 'agreements' && (
                <div className="space-y-3">
                  {!property.agreements?.length ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No agreements yet</p>
                  ) : property.agreements.map(ag => (
                    <div key={ag.id} className="rounded-xl border p-4"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <AgreementStatusBadge status={ag.status} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {ag.durationMonths || '—'} months
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
                        {ag.tenant?.full_name || ag.tenants?.full_name || '—'}
                      </p>
                      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                        {fmt(ag.startDate)} → {fmt(ag.endDate)}
                      </p>
                      <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                        {fmtMoney(ag.monthlyRent)} / month
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Current Agreement ── */}
              {tab === 'current' && (
                <div className="space-y-4">
                  {!activeAgreement ? (
                    <p className="text-sm text-center py-10" style={{ color: 'var(--text-muted)' }}>No active agreement found.</p>
                  ) : (
                    <>
                      {/* Tenant */}
                      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>TENANT</p>
                        <InfoRow label="Name"     value={activeAgreement.tenant?.full_name || activeAgreement.tenants?.full_name || '—'} />
                        <InfoRow label="Email"    value={activeAgreement.tenant?.email || activeAgreement.tenants?.email || '—'} />
                        <InfoRow label="WhatsApp" value={activeAgreement.tenant?.whats_app_no || activeAgreement.tenants?.whats_app_no || '—'} />
                      </div>

                      {/* Broker */}
                      {(activeAgreement.broker || activeAgreement.brokers) && (
                        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>BROKER</p>
                          <InfoRow label="Name"    value={activeAgreement.broker?.name || activeAgreement.brokers?.name || '—'} />
                          <InfoRow label="Contact" value={activeAgreement.broker?.contact_no || activeAgreement.brokers?.contact_no || '—'} />
                        </div>
                      )}

                      {/* Rent */}
                      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>RENT DETAILS</p>
                        <InfoRow label="Monthly Rent"  value={fmtMoney(activeAgreement.monthlyRent)} />
                        <InfoRow label="Rent Due Day"  value={activeAgreement.rentDueDay ? `Day ${activeAgreement.rentDueDay}` : '—'} />
                        <InfoRow label="Start Date"    value={fmt(activeAgreement.startDate)} />
                        <InfoRow label="End Date"      value={fmt(activeAgreement.endDate)} />
                        <InfoRow label="Duration"      value={activeAgreement.durationMonths ? `${activeAgreement.durationMonths} months` : '—'} />
                      </div>

                      {/* Deposit */}
                      <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>DEPOSIT</p>
                        <InfoRow label="Deposit Amount"  value={fmtMoney(activeAgreement.depositAmount)} />
                        <InfoRow label="Deposit Status"  value={activeAgreement.deposit ? 'Received' : 'Pending'} />
                      </div>

                      {/* Brokerage */}
                      {activeAgreement.broker_payment && (
                        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>BROKERAGE</p>
                          <InfoRow label="Brokerage Amount" value={fmtMoney(activeAgreement.broker_payment?.brokerage_amount)} />
                          <InfoRow label="Paid" value={activeAgreement.broker_payment?.is_paid ? 'Yes' : 'No'} />
                        </div>
                      )}

                      {/* Rent Cycles */}
                      {activeAgreement.rentCycles?.length > 0 && (
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--surface-border)' }}>
                          <p className="text-xs font-semibold px-4 py-3 border-b"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                            RENT CYCLES
                          </p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                {['Cycle', 'Start', 'End', 'Monthly Rent'].map(h => (
                                  <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {activeAgreement.rentCycles.map((c, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                  <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                  <td className="px-3 py-2" style={{ color: 'var(--text-main)' }}>{fmt(c.startDate)}</td>
                                  <td className="px-3 py-2" style={{ color: 'var(--text-main)' }}>{fmt(c.endDate)}</td>
                                  <td className="px-3 py-2 font-semibold" style={{ color: 'var(--brand-primary)' }}>{fmtMoney(c.monthlyRent)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
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

export default PropertyDetailDrawer;