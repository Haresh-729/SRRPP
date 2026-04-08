import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconEdit, IconTrash, IconEye, IconLoader2, IconUser } from '@tabler/icons-react';
import { deleteTenant } from '../../../../services/repository/TenantRepo.js';

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TenantTable = ({ data, loading, error, page, limit, isAdmin, onEdit, onView, onRefetch }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await dispatch(deleteTenant(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) onRefetch();
  };

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
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--surface-bg)' }}>
        <IconUser size={28} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No tenants found</p>
      {isAdmin && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add one to get started</p>}
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              {['#', 'Full Name', 'Email', 'WhatsApp No', 'DOB', 'Current Property', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const fullName  = row.fullName         || row.full_name  || '';
              const whatsApp  = row.whatsAppNo       || row.whats_app_no || '';
              const dob       = row.dob              || '';
              const isActive  = row.isActive         ?? row.is_active;
              // Active agreement from list response
              const activeAg  = row.agreements?.find?.(a => a.status === 'ACTIVE') || row.agreements?.[0];
              const propName  = activeAg?.property?.name || null;
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
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    {fullName}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[160px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {row.email || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    +91 {whatsApp}
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {fmt(dob)}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[140px] truncate" style={{ color: propName ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                    {propName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={isActive
                        ? { backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }
                        : { backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isActive ? 'var(--success)' : 'var(--danger)' }} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(row)} title="View"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconEye size={15} />
                      </button>
                      <button onClick={() => onEdit(row)} title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ color: 'var(--brand-primary)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconEdit size={15} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setDeleteTarget(row)} title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ color: 'var(--danger)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <IconTrash size={15} />
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

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}>
              <IconTrash size={20} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 className="text-base font-semibold text-center mb-2" style={{ color: 'var(--text-main)' }}>
              Deactivate Tenant
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              This will deactivate{' '}
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>
                "{deleteTarget.fullName || deleteTarget.full_name}"
              </span>.{' '}
              Tenants with active agreements cannot be deactivated.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
                {deleting && <IconLoader2 size={14} className="animate-spin" />}
                {deleting ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantTable;