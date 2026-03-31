import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconEdit, IconKey, IconHome2, IconTrash, IconInbox, IconLoader2 } from '@tabler/icons-react';
import { deleteUser } from '../../../../services/repository/UserAccessRepo.js';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const UserTable = ({ data, loading, error, page, limit, onEdit, onResetPassword, onPropertyAccess, onRefetch }) => {
  const dispatch = useDispatch();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await dispatch(deleteUser(deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) onRefetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
        <button onClick={onRefetch} className="text-sm font-medium px-4 py-2 rounded-lg border"
          style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}>Retry</button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-bg)' }}>
          <IconInbox size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>No users found</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add one to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              {['#', 'Name', 'Email', 'Active Accesses', 'Status', 'Created At', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const activeAccesses = (row.propertyAccess || []).filter(a => a.isActive).length;
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-main)' }}>
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {row.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold"
                      style={{ backgroundColor: 'rgba(26,107,60,0.1)', color: 'var(--brand-primary)' }}>
                      {activeAccesses}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={row.isActive
                        ? { backgroundColor: 'rgba(30,140,74,0.1)', color: 'var(--success)' }
                        : { backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: row.isActive ? 'var(--success)' : 'var(--danger)' }} />
                      {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--text-muted)' }}>
                    {fmt(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[
                        { icon: IconEdit,  title: 'Edit',             cb: () => onEdit(row),              color: 'var(--brand-primary)', hbg: 'rgba(26,107,60,0.1)' },
                        { icon: IconKey,   title: 'Reset Password',   cb: () => onResetPassword(row),     color: 'var(--accent)',        hbg: 'rgba(232,160,32,0.1)' },
                        { icon: IconHome2, title: 'Property Access',  cb: () => onPropertyAccess(row),    color: 'var(--text-muted)',    hbg: 'var(--surface-bg)' },
                        { icon: IconTrash, title: 'Delete',           cb: () => setDeleteTarget(row),     color: 'var(--danger)',        hbg: 'rgba(217,48,37,0.1)' },
                      ].map(({ icon: Icon, title, cb, color, hbg }) => (
                        <button key={title} onClick={cb} title={title}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = hbg)}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <Icon size={15} />
                        </button>
                      ))}
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
            <h3 className="text-base font-semibold text-center mb-2" style={{ color: 'var(--text-main)' }}>Deactivate User</h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              This will deactivate <span className="font-semibold" style={{ color: 'var(--text-main)' }}>"{deleteTarget.name}"</span> and revoke all their property access.
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
                {deleting ? 'Deleting...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTable;