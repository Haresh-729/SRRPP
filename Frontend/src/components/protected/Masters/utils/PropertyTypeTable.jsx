import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconEdit, IconTrash, IconLoader2, IconInbox } from '@tabler/icons-react';
import { deletePropertyType } from '../../../../services/repository/PropertyTypeRepo.js';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── ConfirmDialog (inline — avoids theme mismatch with common ConfirmDialog) ─
const DeleteConfirm = ({ name, onCancel, onConfirm, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div
      className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
      style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}
      >
        <IconTrash size={20} style={{ color: 'var(--danger)' }} />
      </div>
      <h3 className="text-base font-semibold text-center mb-2" style={{ color: 'var(--text-main)' }}>
        Delete Property Type
      </h3>
      <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
        Are you sure you want to delete <span className="font-semibold" style={{ color: 'var(--text-main)' }}>"{name}"</span>?{' '}
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
          style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
        >
          {loading && <IconLoader2 size={14} className="animate-spin" />}
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── PropertyTypeTable ─────────────────────────────────────────────────────────
const PropertyTypeTable = ({ data, loading, error, page, limit, onEdit, onRefetch }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await dispatch(deletePropertyType(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) onRefetch();
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
        <button
          onClick={onRefetch}
          className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty ──
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-bg)' }}
        >
          <IconInbox size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>
          No property types found
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Add one to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              {['#', 'Name', 'Description', 'Status', 'Created At', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const serial = (page - 1) * limit + idx + 1;
              return (
                <tr
                  key={row.id}
                  style={{ borderBottom: '1px solid var(--surface-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* # */}
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {serial}
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    {row.name}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                    {row.description || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        row.is_active
                          ? { backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }
                          : { backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: row.is_active ? 'var(--success)' : 'var(--danger)' }}
                      />
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(row.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(row)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--brand-primary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Edit"
                      >
                        <IconEdit size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        title="Delete"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </>
  );
};

export default PropertyTypeTable;