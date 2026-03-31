import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconEdit, IconBan, IconCheck, IconX, IconLoader2, IconInbox } from '@tabler/icons-react';
import { updatePropertyAccess, revokePropertyAccess } from '../../../../services/repository/UserAccessRepo.js';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatus = (row) => {
  if (!row.isActive) return { label: 'Revoked', bg: 'rgba(217,48,37,0.1)', color: 'var(--danger)' };
  const now = new Date();
  if (row.validTo && new Date(row.validTo) < now) return { label: 'Expired', bg: 'rgba(232,160,32,0.12)', color: 'var(--warning)' };
  return { label: 'Active', bg: 'rgba(30,140,74,0.1)', color: 'var(--success)' };
};

const PropertyAccessTable = ({ data, loading, onRefetch }) => {
  const dispatch = useDispatch();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      validFrom: row.validFrom ? row.validFrom.split('T')[0] : '',
      validTo: row.validTo ? row.validTo.split('T')[0] : '',
      isActive: row.isActive,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSaving(true);
    const ok = await dispatch(updatePropertyAccess(id, editForm));
    setSaving(false);
    if (ok) { cancelEdit(); onRefetch(); }
  };

  const confirmRevoke = async () => {
    setRevoking(true);
    const ok = await dispatch(revokePropertyAccess(revokeTarget.id));
    setRevoking(false);
    setRevokeTarget(null);
    if (ok) onRefetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <IconInbox size={28} style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No property access assigned yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              {['Property Name', 'Address', 'Valid From', 'Valid To', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const status = getStatus(row);
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {/* Property Name */}
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    {row.property?.name || '—'}
                  </td>
                  {/* Address */}
                  <td className="px-4 py-3 max-w-[180px] truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    {row.property?.address || '—'}
                  </td>
                  {/* Valid From */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <input type="date" value={editForm.validFrom} onChange={e => setEditForm(p => ({ ...p, validFrom: e.target.value }))}
                          className="px-2 py-1 rounded border text-xs outline-none"
                          style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                      : fmt(row.validFrom)}
                  </td>
                  {/* Valid To */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                    {isEditing
                      ? <input type="date" value={editForm.validTo} onChange={e => setEditForm(p => ({ ...p, validTo: e.target.value }))}
                          className="px-2 py-1 rounded border text-xs outline-none"
                          style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                      : fmt(row.validTo)}
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    {isEditing
                      ? (
                        <button type="button" onClick={() => setEditForm(p => ({ ...p, isActive: !p.isActive }))}
                          className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                          style={{ backgroundColor: editForm.isActive ? 'var(--brand-primary)' : 'var(--surface-border)' }}>
                          <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                            style={{ transform: editForm.isActive ? 'translateX(20px)' : 'translateX(2px)' }} />
                        </button>
                      )
                      : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                          {status.label}
                        </span>
                      )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => saveEdit(row.id)} disabled={saving}
                          className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-50"
                          style={{ backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }}>
                          {saving ? <IconLoader2 size={13} className="animate-spin" /> : <IconCheck size={13} />}
                        </button>
                        <button onClick={cancelEdit}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(217,48,37,0.08)', color: 'var(--danger)' }}>
                          <IconX size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(row)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: 'var(--brand-primary)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(26,107,60,0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title="Edit">
                          <IconEdit size={14} />
                        </button>
                        {row.isActive && (
                          <button onClick={() => setRevokeTarget(row)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: 'var(--danger)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(217,48,37,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            title="Revoke">
                            <IconBan size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revoke confirm */}
      {revokeTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRevokeTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(217,48,37,0.1)' }}>
              <IconBan size={18} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 className="text-base font-semibold text-center mb-2" style={{ color: 'var(--text-main)' }}>Revoke Access</h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              Revoke access to <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{revokeTarget.property?.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRevokeTarget(null)} disabled={revoking}
                className="flex-1 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                Cancel
              </button>
              <button onClick={confirmRevoke} disabled={revoking}
                className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
                {revoking && <IconLoader2 size={13} className="animate-spin" />}
                {revoking ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyAccessTable;