import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconEdit, IconTrash, IconEye, IconLoader2, IconInbox } from '@tabler/icons-react';
import { deleteProperty } from '../../../../services/repository/PropertyRepo.js';

const StatusBadge = ({ status }) => {
  const cfg = status === 'RENTED'
    ? { bg: 'rgba(30,140,74,0.1)', color: 'var(--success)', dot: 'var(--success)', label: 'Rented' }
    : { bg: 'rgba(232,160,32,0.12)', color: 'var(--warning)', dot: 'var(--warning)', label: 'Vacant' };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

const PropertyTable = ({ data, loading, error, page, limit, isAdmin, onEdit, onView, onRefetch }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await dispatch(deleteProperty(deleteTarget.id));
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
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-bg)' }}>
        <IconInbox size={28} style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No properties found</p>
      {isAdmin && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add one to get started</p>}
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              {['#', 'Property Name', 'Type', 'Address', 'Area (sq.ft.)', 'Status', 'Current Tenant', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const activeAg    = row.agreements?.find(a => a.status === 'ACTIVE');
              const tenant      = activeAg?.tenant || activeAg?.tenants;
              const typeName    = row.propertyType?.name || row.property_types?.name;
              const address     = row.address || '';
              const truncAddr   = address.length > 40 ? address.slice(0, 40) + '…' : address;

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
                    {row.name}
                  </td>
                  <td className="px-4 py-3">
                    {typeName && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--surface-bg)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}>
                        {typeName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[180px]" style={{ color: 'var(--text-muted)' }} title={address}>
                    {truncAddr || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-right" style={{ color: 'var(--text-main)' }}>
                    {row.areaSqFt != null ? Number(row.areaSqFt).toLocaleString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {tenant?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onView(row)} title="View"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconEye size={15} />
                      </button>
                      {isAdmin && (<>
                        <button onClick={() => onEdit(row)} title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: 'var(--brand-primary)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <IconEdit size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(row)} title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: 'var(--danger)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <IconTrash size={15} />
                        </button>
                      </>)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}>
              <IconTrash size={20} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 className="text-base font-semibold text-center mb-2" style={{ color: 'var(--text-main)' }}>Delete Property</h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--text-main)' }}>"{deleteTarget.name}"</span>?{' '}
              Properties with existing agreements cannot be deleted.
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
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyTable;