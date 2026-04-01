import { IconEye, IconFileText, IconBan, IconInbox } from '@tabler/icons-react';

const fmt     = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n)  => n  != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE:     { bg: 'rgba(30,140,74,0.1)',    color: 'var(--success)' },
    EXPIRED:    { bg: 'rgba(232,160,32,0.12)',  color: 'var(--warning)' },
    TERMINATED: { bg: 'rgba(217,48,37,0.1)',    color: 'var(--danger)'  },
  };
  const cfg = map[status] || map.EXPIRED;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {status}
    </span>
  );
};

const AgreementTable = ({ data, loading, error, page, limit, isAdmin, onView, onPdf, onTerminate, onRefetch }) => {
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
      <button onClick={onRefetch} className="text-sm px-4 py-2 rounded-lg border"
        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}>Retry</button>
    </div>
  );
  if (!data?.length) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <IconInbox size={28} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No agreements found</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
            {['#', 'Property', 'Tenant', 'Duration', 'Monthly Rent', 'Due Day', 'Deposit', 'Brokerage', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const prop  = row.properties || row.property;
            const ten   = row.tenants    || row.tenant;
            const bp    = row.brokerage_payments || row.brokeragePayment;
            const dp    = row.deposit_payments   || row.depositPayment;
            const esc   = row.rent_escalation_percent;

            return (
              <tr key={row.id}
                onClick={() => onView(row)}
                className="cursor-pointer"
                style={{ borderBottom: '1px solid var(--surface-border)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {(page - 1) * limit + idx + 1}
                </td>
                <td className="px-4 py-3 max-w-[160px]">
                  <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-main)' }}>{prop?.name || '—'}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{prop?.address || ''}</p>
                </td>
                <td className="px-4 py-3 max-w-[140px]">
                  <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-main)' }}>{ten?.full_name || '—'}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ten?.whats_app_no ? `+91 ${ten.whats_app_no}` : ''}</p>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  <p style={{ color: 'var(--text-main)' }}>{row.duration_months} months</p>
                  <p className="text-[10px]">{fmt(row.start_date)} → {fmt(row.end_date)}</p>
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{fmtMoney(row.monthly_rent)}</p>
                  {esc && Number(esc) > 0 && (
                    <span className="text-[10px] px-1 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: 'var(--brand-primary)' }}>
                      ↑ {Number(esc)}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Every {row.rent_due_day}th
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <p style={{ color: 'var(--text-main)' }}>{fmtMoney(row.deposit_amount)}</p>
                  {dp ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>Received {fmt(dp.received_on)}</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {bp ? (
                    <>
                      <p style={{ color: 'var(--text-main)' }}>{fmtMoney(bp.brokerage_amount)}</p>
                      {bp.is_paid
                        ? <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>Paid</span>
                        : <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Pending</span>
                      }
                    </>
                  ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView(row)} title="View"
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <IconEye size={15} />
                    </button>
                    <button onClick={() => onPdf(row)} title={row.agreement_pdf ? 'View PDF' : 'Upload PDF'}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ color: row.agreement_pdf ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <IconFileText size={15} />
                    </button>
                    {isAdmin && row.status === 'ACTIVE' && (
                      <button onClick={() => onTerminate(row)} title="Terminate"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconBan size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AgreementTable;