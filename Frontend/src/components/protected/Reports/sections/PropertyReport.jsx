import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { getPropertyReport } from '../../../../services/repository/ReportsRepo.js';
import { getPropertySummary } from '../../../../services/repository/PropertyRepo.js';
import {
  Loading, ErrorState, ProgressBar, InfoRow,
  fmtMoney, fmt, collectionRate,
  COLORS, Card, SectionTitle, FilterSelect,
  PropertyStatusBadge, AgreementStatusBadge,
} from '../utils/reportUtils.jsx';

export default function PropertyReport() {
  const dispatch = useDispatch();
  const [propertyId,  setPropertyId]  = useState('');
  const [properties,  setProperties]  = useState([]);
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [expanded,    setExpanded]    = useState({});

  useEffect(() => {
    dispatch(getPropertySummary()).then(r => {
      if (r && Array.isArray(r)) setProperties(r);
    });
  }, []);

  const handleSelect = (id) => {
    setPropertyId(id);
    if (!id) { setData(null); return; }
    setLoading(true); setError(null); setExpanded({});
    dispatch(getPropertyReport(id)).then(r => {
      if (r) setData(r); else setError('Failed to load property report.');
      setLoading(false);
    });
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const { property, currentAgreement, totalAgreements, lifetimeTotals, agreements = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card>
        <div className="p-5">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            Select Property
          </label>
          <FilterSelect value={propertyId} onChange={handleSelect} className="w-full max-w-sm">
            <option value="">Select a property to view detailed report...</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.address}</option>)}
          </FilterSelect>
        </div>
      </Card>

      {!propertyId && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Select a property to view its detailed report</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>All agreements, financials, and history will appear here</p>
        </div>
      )}

      {loading && <Loading label="Loading property report..." />}
      {error   && <ErrorState msg={error} onRetry={() => handleSelect(propertyId)} />}

      {data && !loading && (
        <>
          {/* Property Header */}
          <Card>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <PropertyStatusBadge status={property?.status} />
                    {property?.property_types?.name && (
                      <span className="px-2 py-0.5 rounded-full text-xs border"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}>
                        {property.property_types.name}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>{property?.name}</h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{property?.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Lifetime Collected</p>
                  <p className="text-2xl font-extrabold" style={{ color: COLORS.primary }}>
                    {fmtMoney(lifetimeTotals?.totalRentCollected)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{lifetimeTotals?.totalPaymentTransactions} transactions</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><p style={{ color: 'var(--text-muted)' }}>Area</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{property?.area_sq_ft ? `${Number(property.area_sq_ft).toLocaleString()} sq.ft.` : '—'}</p></div>
                <div><p style={{ color: 'var(--text-muted)' }}>Purchase Date</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmt(property?.purchase_date)}</p></div>
                <div><p style={{ color: 'var(--text-muted)' }}>Purchase Amount</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(property?.purchase_amount)}</p></div>
                <div><p style={{ color: 'var(--text-muted)' }}>Total Agreements</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{totalAgreements}</p></div>
              </div>
            </div>
          </Card>

          {/* Current Agreement */}
          {currentAgreement ? (
            <div className="rounded-2xl border p-5"
              style={{ backgroundColor: 'rgba(232,160,32,0.05)', borderColor: 'rgba(232,160,32,0.35)' }}>
              <SectionTitle>Current Active Tenant</SectionTitle>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold text-base" style={{ color: 'var(--text-main)' }}>{currentAgreement.tenant?.full_name || '—'}</p>
                  <p style={{ color: 'var(--text-muted)' }}>{currentAgreement.tenant?.email}</p>
                  {currentAgreement.tenant?.whats_app_no && (
                    <p style={{ color: 'var(--text-muted)' }}>+91 {currentAgreement.tenant.whats_app_no}</p>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <p style={{ color: 'var(--text-muted)' }}>Period: <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmt(currentAgreement.startDate)} → {fmt(currentAgreement.endDate)}</span></p>
                  <p style={{ color: 'var(--text-muted)' }}>Monthly Rent: <span className="font-semibold" style={{ color: COLORS.primary }}>{fmtMoney(currentAgreement.monthlyRent)}</span></p>
                  <p style={{ color: 'var(--text-muted)' }}>Duration: <span style={{ color: 'var(--text-main)' }}>{currentAgreement.durationMonths} months</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
              <span className="text-xl">🏠</span>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Property is currently vacant</p>
            </div>
          )}

          {/* Agreement History */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
              Agreement History ({agreements.length})
            </p>
            <div className="space-y-3">
              {agreements.map((ag) => {
                const fin = ag.financials || {};
                const pct = collectionRate(fin.totalCollected, fin.totalRentDue);
                const isOpen = expanded[ag.id];
                const cycles = ag.agreement_rent_cycles || [];
                return (
                  <div key={ag.id} className="rounded-2xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                    {/* Collapsed header */}
                    <button className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-opacity-80"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggle(ag.id)}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <AgreementStatusBadge status={ag.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                            {ag.tenants?.full_name || '—'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {fmt(ag.start_date)} → {fmt(ag.end_date)} · {fmtMoney(ag.monthly_rent)}/mo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold" style={{ color: COLORS.success }}>{fmtMoney(fin.totalCollected)}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>of {fmtMoney(fin.totalRentDue)}</p>
                        </div>
                        <div className="w-16 hidden sm:block">
                          <ProgressBar pct={pct} showPct={false} />
                          <p className="text-[10px] text-right mt-0.5" style={{ color: 'var(--text-muted)' }}>{Math.round(pct)}%</p>
                        </div>
                        {isOpen ? <IconChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <IconChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="border-t px-5 py-5 space-y-4" style={{ borderColor: 'var(--surface-border)' }}>
                        {/* Agreement info */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <SectionTitle>Agreement Info</SectionTitle>
                            <InfoRow label="Duration"     value={`${ag.duration_months} months`} />
                            <InfoRow label="Due Day"      value={`${ag.rent_due_day}th of every month`} />
                            <InfoRow label="Escalation"   value={ag.rent_escalation_percent > 0 ? `${Number(ag.rent_escalation_percent)}%` : 'None'} />
                            <InfoRow label="Deposit"      value={fmtMoney(ag.deposit_amount)} />
                            <InfoRow label="Deposit Paid" value={ag.deposit_payments ? `${fmtMoney(ag.deposit_payments.amount)} on ${fmt(ag.deposit_payments.received_on)}` : 'Pending'} />
                          </div>
                          <div>
                            <SectionTitle>Tenant</SectionTitle>
                            <InfoRow label="Name"    value={ag.tenants?.full_name || '—'} />
                            <InfoRow label="Email"   value={ag.tenants?.email || '—'} />
                            <InfoRow label="WhatsApp" value={ag.tenants?.whats_app_no ? `+91 ${ag.tenants.whats_app_no}` : '—'} />
                            {ag.tenants?.permanent_address && <InfoRow label="Address" value={ag.tenants.permanent_address} />}
                          </div>
                        </div>

                        {/* Broker */}
                        {ag.brokers && (
                          <div>
                            <SectionTitle>Broker</SectionTitle>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <InfoRow label="Name"    value={ag.brokers.name} />
                              <InfoRow label="Contact" value={`+91 ${ag.brokers.contact_no}`} />
                              {ag.brokerage_payments && (
                                <InfoRow label="Brokerage" value={`₹${Number(ag.brokerage_payments.brokerage_amount).toLocaleString('en-IN')} — ${ag.brokerage_payments.is_paid ? 'Paid ✓' : 'Pending'}`} />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Rent Cycles */}
                        {cycles.length > 0 && (
                          <div>
                            <SectionTitle>Rent Cycles</SectionTitle>
                            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                    {['Cycle','Start','End','Monthly Rent'].map(h => (
                                      <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {cycles.map(c => (
                                    <tr key={c.id || c.cycle_number} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                      <td className="px-3 py-2 font-semibold" style={{ color: 'var(--text-main)' }}>#{c.cycle_number}</td>
                                      <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{fmt(c.start_date)}</td>
                                      <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>{fmt(c.end_date)}</td>
                                      <td className="px-3 py-2 font-semibold" style={{ color: COLORS.primary }}>{fmtMoney(c.monthly_rent)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Financials */}
                        <div>
                          <SectionTitle>Financials</SectionTitle>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                            {[
                              { label: 'Total Rent Due', value: fmtMoney(fin.totalRentDue), c: 'var(--text-main)' },
                              { label: 'Total Collected', value: fmtMoney(fin.totalCollected), c: COLORS.success },
                              { label: 'Outstanding', value: fin.outstandingBalance > 0 ? fmtMoney(fin.outstandingBalance) : '—', c: fin.outstandingBalance > 0 ? COLORS.danger : 'var(--text-muted)' },
                              { label: 'Collection %', value: `${Math.round(pct)}%`, c: pct >= 90 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger },
                            ].map(item => (
                              <div key={item.label} className="rounded-xl p-3 border text-center"
                                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                <p className="text-sm font-bold" style={{ color: item.c }}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                          {fin.ledgerStats && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {Object.entries({ Paid: 'success', Partial: 'warning', Pending: 'text-muted', Overdue: 'danger' }).map(([k, type]) => {
                                const val = fin.ledgerStats[k.toLowerCase()] ?? fin.ledgerStats[k] ?? 0;
                                const c = { success: COLORS.success, warning: COLORS.warning, danger: COLORS.danger, 'text-muted': 'var(--text-muted)' }[type];
                                return (
                                  <span key={k} className="px-2.5 py-1 rounded-full font-semibold"
                                    style={{ backgroundColor: `${c}18`, color: c }}>
                                    {k}: {val}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <div className="mt-3"><ProgressBar pct={pct} label="Overall collection rate" /></div>
                        </div>

                        {/* Termination */}
                        {ag.status === 'TERMINATED' && (
                          <div className="rounded-xl border p-4"
                            style={{ backgroundColor: 'rgba(217,48,37,0.05)', borderColor: 'rgba(217,48,37,0.3)' }}>
                            <p className="text-xs font-bold mb-1" style={{ color: COLORS.danger }}>TERMINATED</p>
                            <p className="text-xs" style={{ color: 'var(--text-main)' }}>
                              <strong>At:</strong> {fmt(ag.terminated_at)}
                            </p>
                            {ag.termination_reason && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-main)' }}>
                                <strong>Reason:</strong> {ag.termination_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}