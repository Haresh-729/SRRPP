import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { getTenantReport } from '../../../../services/repository/ReportsRepo.js';
import { getTenantSummary } from '../../../../services/repository/TenantRepo.js';
import {
  Loading, ErrorState, ProgressBar, InfoRow,
  fmtMoney, fmt, collectionRate, calcAge, daysUntil,
  COLORS, Card, SectionTitle, FilterSelect,
  AgreementStatusBadge,
} from '../utils/reportUtils.jsx';

export default function TenantReport() {
  const dispatch = useDispatch();
  const [tenantId,  setTenantId]  = useState('');
  const [tenants,   setTenants]   = useState([]);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [expanded,  setExpanded]  = useState({});

  useEffect(() => {
    dispatch(getTenantSummary()).then(r => { if (r && Array.isArray(r)) setTenants(r); });
  }, []);

  const handleSelect = (id) => {
    setTenantId(id);
    if (!id) { setData(null); return; }
    setLoading(true); setError(null); setExpanded({});
    dispatch(getTenantReport(id)).then(r => {
      if (r) setData(r); else setError('Failed to load tenant report.');
      setLoading(false);
    });
  };

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const { tenant, activeAgreement, totalAgreements = 0, lifetimeTotals = {}, agreements = [] } = data || {};

  const initials = tenant?.full_name
    ? tenant.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  const age = calcAge(tenant?.dob);

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card>
        <div className="p-5">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Select Tenant</label>
          <FilterSelect value={tenantId} onChange={handleSelect} className="w-full max-w-sm">
            <option value="">Select a tenant to view their detailed report...</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.fullName || t.full_name} — {t.email}</option>
            ))}
          </FilterSelect>
        </div>
      </Card>

      {!tenantId && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Select a tenant to view their detailed report</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>All agreements, payment history, and financials appear here</p>
        </div>
      )}

      {loading && <Loading label="Loading tenant report..." />}
      {error   && <ErrorState msg={error} onRetry={() => handleSelect(tenantId)} />}

      {data && !loading && (
        <>
          {/* Tenant Header */}
          <Card>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: COLORS.primary, color: '#fff' }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>{tenant?.full_name}</h2>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={tenant?.is_active
                        ? { backgroundColor: 'rgba(30,140,74,0.1)', color: COLORS.success }
                        : { backgroundColor: 'rgba(217,48,37,0.1)', color: COLORS.danger }}>
                      {tenant?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tenant?.email}</p>
                  {tenant?.whats_app_no && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {tenant.whats_app_no}</p>
                  )}
                  {tenant?.dob && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      DOB: {fmt(tenant.dob)}{age ? ` (${age} years)` : ''}
                    </p>
                  )}
                  {tenant?.permanent_address && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>📍 {tenant.permanent_address}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Tenant since: {fmt(tenant?.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Lifetime summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Agreements', value: totalAgreements, color: COLORS.primary },
              { label: 'Total Collected',  value: fmtMoney(lifetimeTotals.totalRentCollected), color: COLORS.success },
              { label: 'Transactions',     value: lifetimeTotals.totalTransactions || lifetimeTotals.totalPaymentTransactions || 0, color: COLORS.primary },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border p-4 text-center"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                <p className="text-lg font-extrabold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Active Agreement highlight */}
          {activeAgreement ? (
            <div className="rounded-2xl border p-5"
              style={{ backgroundColor: 'rgba(232,160,32,0.05)', borderColor: 'rgba(232,160,32,0.35)' }}>
              <SectionTitle>Currently Renting</SectionTitle>
              <p className="text-base font-bold mb-1" style={{ color: 'var(--text-main)' }}>{activeAgreement.property?.name}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{activeAgreement.property?.address}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><p style={{ color: 'var(--text-muted)' }}>Monthly Rent</p><p className="font-bold" style={{ color: COLORS.primary }}>{fmtMoney(activeAgreement.monthlyRent)}</p></div>
                <div><p style={{ color: 'var(--text-muted)' }}>Period</p><p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmt(activeAgreement.startDate)} → {fmt(activeAgreement.endDate)}</p></div>
                <div><p style={{ color: 'var(--text-muted)' }}>Days Remaining</p><p className="font-bold" style={{ color: daysUntil(activeAgreement.endDate) < 30 ? COLORS.danger : COLORS.success }}>{Math.max(0, daysUntil(activeAgreement.endDate))} days</p></div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
              <span className="text-xl">🔑</span>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active rental agreement</p>
            </div>
          )}

          {/* Agreement history accordion */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-main)' }}>
              Agreement History ({agreements.length})
            </p>
            <div className="space-y-3">
              {agreements.map(ag => {
                const fin  = ag.financials || {};
                const pct  = collectionRate(fin.totalCollected, fin.totalDue);
                const isOpen = expanded[ag.id];
                const cycles = ag.agreement_rent_cycles || [];
                return (
                  <div key={ag.id} className="rounded-2xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                    <button className="w-full flex items-center justify-between gap-4 p-4 text-left"
                      onClick={() => toggle(ag.id)}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <AgreementStatusBadge status={ag.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
                            {ag.properties?.name || '—'}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {fmt(ag.start_date)} → {fmt(ag.end_date)} · {fmtMoney(ag.monthly_rent)}/mo
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold" style={{ color: COLORS.success }}>{fmtMoney(fin.totalCollected)}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{Math.round(pct)}% collected</p>
                        </div>
                        {isOpen ? <IconChevronDown size={16} style={{ color: 'var(--text-muted)' }} /> : <IconChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t px-5 py-5 space-y-4" style={{ borderColor: 'var(--surface-border)' }}>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <SectionTitle>Property</SectionTitle>
                            <InfoRow label="Name"    value={ag.properties?.name || '—'} />
                            <InfoRow label="Address" value={ag.properties?.address || '—'} />
                          </div>
                          <div>
                            <SectionTitle>Agreement</SectionTitle>
                            <InfoRow label="Duration"   value={`${ag.duration_months} months`} />
                            <InfoRow label="Due Day"    value={`${ag.rent_due_day}th`} />
                            <InfoRow label="Escalation" value={ag.rent_escalation_percent > 0 ? `${Number(ag.rent_escalation_percent)}%` : 'None'} />
                            <InfoRow label="Deposit"    value={fmtMoney(ag.deposit_amount)} />
                            <InfoRow label="Deposit Paid" value={ag.deposit_payments ? `${fmtMoney(ag.deposit_payments.amount)} — ${ag.deposit_payments.payment_mode}` : 'Pending'} />
                          </div>
                        </div>

                        {cycles.length > 0 && (
                          <div>
                            <SectionTitle>Rent Cycles</SectionTitle>
                            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--surface-border)' }}>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                    {['Cycle','Start','End','Rent'].map(h => (
                                      <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {cycles.map(c => (
                                    <tr key={c.id || c.cycle_number} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                      <td className="px-3 py-2" style={{ color: 'var(--text-main)' }}>#{c.cycle_number}</td>
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
                              { label: 'Total Due',    value: fmtMoney(fin.totalDue),        c: 'var(--text-main)' },
                              { label: 'Collected',    value: fmtMoney(fin.totalCollected),   c: COLORS.success    },
                              { label: 'Pending',      value: fin.pendingBalance > 0 ? fmtMoney(fin.pendingBalance) : '—', c: fin.pendingBalance > 0 ? COLORS.warning : 'var(--text-muted)' },
                              { label: 'Transactions', value: fin.totalTransactions || 0,     c: 'var(--text-main)' },
                            ].map(item => (
                              <div key={item.label} className="rounded-xl p-3 border text-center"
                                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                <p className="text-sm font-bold" style={{ color: item.c }}>{item.value}</p>
                              </div>
                            ))}
                          </div>
                          <ProgressBar pct={pct} label="Collection rate" />
                        </div>

                        {ag.status === 'TERMINATED' && (
                          <div className="rounded-xl border p-4"
                            style={{ backgroundColor: 'rgba(217,48,37,0.05)', borderColor: 'rgba(217,48,37,0.3)' }}>
                            <p className="text-xs font-bold mb-1" style={{ color: COLORS.danger }}>TERMINATED</p>
                            <p className="text-xs" style={{ color: 'var(--text-main)' }}><strong>At:</strong> {fmt(ag.terminated_at)}</p>
                            {ag.termination_reason && <p className="text-xs mt-1" style={{ color: 'var(--text-main)' }}><strong>Reason:</strong> {ag.termination_reason}</p>}
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