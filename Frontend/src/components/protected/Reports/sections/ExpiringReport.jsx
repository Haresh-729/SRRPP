import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getExpiringAgreementsReport } from '../../../../services/repository/ReportsRepo.js';
import {
  Loading, ErrorState, EmptyState, fmtMoney, fmt, daysUntil,
  COLORS, Card, FetchButton, FilterInput,
} from '../utils/reportUtils.jsx';
import Pagination from '../../../common/Pagination.jsx';

const LIMIT = 10;
const PRESETS = [7, 30, 60, 90];

const urgencyColor = (days) => {
  if (days <= 7)  return COLORS.danger;
  if (days <= 30) return COLORS.warning;
  if (days <= 60) return COLORS.accent;
  return 'var(--text-muted)';
};

export default function ExpiringReport() {
  const dispatch = useDispatch();
  const [days,    setDays]    = useState('30');
  const [page,    setPage]    = useState(1);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchReport = (pg = 1) => {
    setLoading(true); setError(null);
    dispatch(getExpiringAgreementsReport({ days: days || 30, page: pg, limit: LIMIT })).then(r => {
      if (r) setResult(r); else setError('Failed to load expiring agreements report.');
      setLoading(false);
    });
  };

  useEffect(() => { fetchReport(); }, []);

  const items = result?.data?.agreements || [];
  const meta  = result?.data?.meta       || { total: 0, totalPages: 1 };
  const daysNum = Number(days) || 30;
  const alertColor = daysNum <= 30 ? COLORS.danger : COLORS.warning;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Days</label>
            <FilterInput type="number" value={days} onChange={setDays} min="1" max="365" placeholder="Days" />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(d => (
              <button key={d} type="button" onClick={() => setDays(String(d))}
                className="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
                style={{
                  borderColor: days === String(d) ? COLORS.primary : 'var(--surface-border)',
                  backgroundColor: days === String(d) ? 'rgba(26,107,60,0.1)' : 'var(--surface-bg)',
                  color: days === String(d) ? COLORS.primary : 'var(--text-muted)',
                }}>
                {d} days
              </button>
            ))}
          </div>
          <FetchButton onClick={() => { setPage(1); fetchReport(1); }} loading={loading} />
        </div>
      </Card>

      {loading ? <Loading label={`Finding agreements expiring in ${days} days...`} /> : error ? <ErrorState msg={error} onRetry={() => fetchReport(page)} /> : (
        <>
          {/* Alert banner */}
          {meta.total > 0 ? (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: `${alertColor}12`, borderColor: `${alertColor}40` }}>
              <span className="text-xl">⏰</span>
              <p className="text-sm font-semibold" style={{ color: alertColor }}>
                {meta.total} agreement{meta.total !== 1 ? 's' : ''} expiring in the next {days} days
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(30,140,74,0.06)', borderColor: 'rgba(30,140,74,0.3)' }}>
              <span className="text-xl">✅</span>
              <p className="text-sm font-semibold" style={{ color: COLORS.success }}>
                No agreements expiring in the next {days} days
              </p>
            </div>
          )}

          {!items.length ? <EmptyState msg={`No agreements expiring in the next ${days} days.`} /> : (
            <>
              <div className="space-y-4">
                {items.map(ag => {
                  const remaining = daysUntil(ag.end_date);
                  const color = urgencyColor(remaining);
                  return (
                    <div key={ag.id} className="rounded-2xl border overflow-hidden"
                      style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                      <div className="p-5">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold truncate" style={{ color: 'var(--text-main)' }}>
                              {ag.properties?.name || '—'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ag.properties?.address || ''}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                              style={{ backgroundColor: `${color}18`, color }}>
                              ⏰ {remaining <= 0 ? 'Expired' : `${remaining} day${remaining !== 1 ? 's' : ''} left`}
                            </span>
                          </div>
                        </div>

                        {/* Tenant info */}
                        <div className="rounded-xl p-3 mb-4"
                          style={{ backgroundColor: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                            {ag.tenants?.full_name || '—'}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {ag.tenants?.email && (
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ag.tenants.email}</p>
                            )}
                            {ag.tenants?.whats_app_no && (
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {ag.tenants.whats_app_no}</p>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Start Date</p>
                            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmt(ag.start_date)}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>End Date</p>
                            <p className="font-semibold" style={{ color }}>{fmt(ag.end_date)}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Duration</p>
                            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{ag.duration_months} months</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Monthly Rent</p>
                            <p className="font-semibold" style={{ color: COLORS.primary }}>{fmtMoney(ag.monthly_rent)}</p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)' }}>Deposit</p>
                            <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(ag.deposit_amount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {meta.total > LIMIT && (
                <div className="flex justify-center">
                  <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
                    itemsPerPage={LIMIT} onPageChange={p => { setPage(p); fetchReport(p); }} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}