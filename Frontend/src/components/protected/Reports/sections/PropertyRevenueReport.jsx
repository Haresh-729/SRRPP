import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getPropertyRevenueReport } from '../../../../services/repository/ReportsRepo.js';
import {
  Loading, ErrorState, EmptyState, ProgressBar,
  fmtMoney, fmtMoneyK, fmt, collectionRate,
  COLORS, Card, SectionTitle, FilterSelect, FetchButton,
  PropertyStatusBadge, AgreementStatusBadge,
} from '../utils/reportUtils.jsx';
import Pagination from '../../../common/Pagination.jsx';

const now = new Date();
const YEARS = Array.from({ length: 6 }, (_, i) => now.getFullYear() - i);
const LIMIT = 8;

export default function PropertyRevenueReport() {
  const dispatch = useDispatch();
  const [year,    setYear]    = useState(String(now.getFullYear()));
  const [page,    setPage]    = useState(1);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchReport = (pg = 1) => {
    setLoading(true); setError(null);
    dispatch(getPropertyRevenueReport({ year: year || undefined, page: pg, limit: LIMIT })).then(r => {
      if (r) setResult(r); else setError('Failed to load property revenue report.');
      setLoading(false);
    });
  };

  useEffect(() => { fetchReport(); }, []);

  const items = result?.data?.properties || [];
  const meta  = result?.data?.meta       || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Year</label>
            <FilterSelect value={year} onChange={setYear}>
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </FilterSelect>
          </div>
          <FetchButton onClick={() => { setPage(1); fetchReport(1); }} loading={loading} />
        </div>
      </Card>

      {loading ? <Loading label="Loading property revenue..." /> : error ? <ErrorState msg={error} onRetry={() => fetchReport(page)} /> : !items.length ? <EmptyState msg="No properties found." /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(({ property, activeAgreement, totalAgreements, revenue }) => {
              const pct = collectionRate(revenue.totalCollected, revenue.totalDue);
              return (
                <div key={property.id} className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
                  {/* Card header */}
                  <div className="p-5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PropertyStatusBadge status={property.status} />
                        {property.property_types?.name && (
                          <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                            {property.property_types.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{property.name}</p>
                    <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{property.address}</p>
                  </div>

                  {/* Tenant / Agreement info */}
                  <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                    {activeAgreement ? (
                      <div className="space-y-1 text-xs">
                        <p style={{ color: 'var(--text-muted)' }}>
                          Tenant: <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                            {activeAgreement.tenants?.full_name || '—'}
                          </span>
                        </p>
                        <p style={{ color: 'var(--text-muted)' }}>
                          Monthly Rent: <span className="font-semibold" style={{ color: COLORS.primary }}>
                            {fmtMoney(activeAgreement.monthly_rent)}
                          </span>
                        </p>
                        <p style={{ color: 'var(--text-muted)' }}>
                          Period: {fmt(activeAgreement.start_date)} → {fmt(activeAgreement.end_date)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No active agreement</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Total Agreements: <span style={{ color: 'var(--text-main)' }}>{totalAgreements}</span>
                    </p>
                  </div>

                  {/* Revenue metrics */}
                  <div className="p-5">
                    <SectionTitle>Revenue{year ? ` — ${year}` : ' — All Time'}</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4">
                      <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Due</span><span style={{ color: 'var(--text-main)' }}>{fmtMoneyK(revenue.totalDue)}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Collected</span><span className="font-semibold" style={{ color: COLORS.success }}>{fmtMoneyK(revenue.totalCollected)}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Outstanding</span><span className="font-semibold" style={{ color: revenue.totalOutstanding > 0 ? COLORS.danger : 'var(--text-muted)' }}>{revenue.totalOutstanding > 0 ? fmtMoneyK(revenue.totalOutstanding) : '—'}</span></div>
                      <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Transactions</span><span style={{ color: 'var(--text-main)' }}>{revenue.totalTransactions}</span></div>
                    </div>
                    <ProgressBar pct={pct} label="Collection rate" />
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
    </div>
  );
}