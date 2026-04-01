import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { getOverduePaymentsReport } from '../../../../services/repository/ReportsRepo.js';
import { getPropertySummary } from '../../../../services/repository/PropertyRepo.js';
import {
  KpiCard, Loading, ErrorState, EmptyState,
  fmtMoney, fmt, fmtMonth, daysSince, collectionRate,
  COLORS, Card, FilterSelect,
} from '../utils/reportUtils.jsx';
import Pagination from '../../../common/Pagination.jsx';

const LIMIT = 10;

export default function OverdueReport() {
  const dispatch = useDispatch();
  const [propertyId,  setPropertyId]  = useState('');
  const [properties,  setProperties]  = useState([]);
  const [page,        setPage]        = useState(1);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchReport = (pg = 1) => {
    setLoading(true); setError(null);
    dispatch(getOverduePaymentsReport({ propertyId: propertyId || undefined, page: pg, limit: LIMIT })).then(r => {
      if (r) setResult(r); else setError('Failed to load overdue report.');
      setLoading(false);
    });
  };

  useEffect(() => {
    dispatch(getPropertySummary()).then(r => { if (r && Array.isArray(r)) setProperties(r); });
    fetchReport();
  }, []);

  const ledgers     = result?.data?.ledgers          || [];
  const meta        = result?.data?.meta             || { total: 0, totalPages: 1 };
  const totalAmt    = result?.data?.totalOverdueAmount ?? result?.data?.total_overdue_amount ?? 0;
  const avgPerLedger = meta.total > 0 ? Number(totalAmt) / meta.total : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Property</label>
            <FilterSelect value={propertyId} onChange={setPropertyId}>
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </FilterSelect>
          </div>
          <div className="mt-4">
            <button onClick={() => { setPage(1); fetchReport(1); }} disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-50"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <IconRefresh size={14} /> Reset
            </button>
          </div>
        </div>
      </Card>

      {loading ? <Loading label="Loading overdue payments..." /> : error ? <ErrorState msg={error} onRetry={() => fetchReport(page)} /> : (
        <>
          {/* Alert / Success banner */}
          {Number(totalAmt) > 0 ? (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(217,48,37,0.08)', borderColor: 'rgba(217,48,37,0.4)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(217,48,37,0.15)' }}>
                <IconAlertTriangle size={18} style={{ color: COLORS.danger }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: COLORS.danger }}>
                  Total overdue amount: {fmtMoney(totalAmt)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  across {meta.total} overdue ledger{meta.total !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border p-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(30,140,74,0.06)', borderColor: 'rgba(30,140,74,0.3)' }}>
              <span className="text-xl">🎉</span>
              <p className="text-sm font-semibold" style={{ color: COLORS.success }}>
                No overdue payments — all caught up! ✓
              </p>
            </div>
          )}

          {/* KPIs */}
          {Number(totalAmt) > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <KpiCard icon={IconAlertTriangle} label="Total Overdue"  value={fmtMoney(totalAmt)} color={COLORS.danger}   sub={fmtMoney(totalAmt)} />
              <KpiCard icon={IconAlertTriangle} label="Overdue Ledgers" value={meta.total}          color={COLORS.danger} />
              <KpiCard icon={IconAlertTriangle} label="Avg per Ledger"  value={fmtMoney(avgPerLedger)} color={COLORS.warning} />
            </div>
          )}

          {!ledgers.length ? <EmptyState msg="No overdue ledgers found." /> : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      {['#','Property','Tenant','Month','Rent Amt','Total Due','Paid','Balance','Due Date','Overdue Since'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wide whitespace-nowrap"
                          style={{ color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ledgers.map((l, i) => {
                      const days = daysSince(l.due_date);
                      const bal  = Number(l.balance_carried || 0);
                      return (
                        <tr key={l.id}
                          style={{ borderBottom: '1px solid var(--surface-border)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{(page-1)*LIMIT+i+1}</td>
                          <td className="px-4 py-3 max-w-[140px]">
                            <p className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{l.properties?.name || '—'}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{l.properties?.address || ''}</p>
                          </td>
                          <td className="px-4 py-3 max-w-[130px]">
                            <p className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{l.tenants?.full_name || '—'}</p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{l.tenants?.email || ''}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                            {fmtMonth(l.ledger_month)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.rent_amount)}</td>
                          <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>{fmtMoney(l.total_due)}</td>
                          <td className="px-4 py-3 whitespace-nowrap" style={{ color: Number(l.paid_amount) > 0 ? COLORS.success : 'var(--text-muted)' }}>
                            {Number(l.paid_amount) > 0 ? fmtMoney(l.paid_amount) : '—'}
                          </td>
                          <td className="px-4 py-3 font-bold whitespace-nowrap" style={{ color: COLORS.danger }}>{fmtMoney(bal)}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: COLORS.danger }}>{fmt(l.due_date)}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold" style={{ color: COLORS.danger }}>
                            {days} day{days !== 1 ? 's' : ''} ago
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {meta.total > LIMIT && (
                <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                  <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
                    itemsPerPage={LIMIT} onPageChange={p => { setPage(p); fetchReport(p); }} />
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}