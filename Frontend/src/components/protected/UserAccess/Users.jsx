import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconPlus, IconSearch, IconRefresh } from '@tabler/icons-react';
import { listUsers, getUserById } from '../../../services/repository/UserAccessRepo.js';
import UserTable from './utils/UserTable.jsx';
import UserFormModal from './utils/UserFormModal.jsx';
import ResetPasswordModal from './utils/ResetPasswordModal.jsx';
import PropertyAccessModal from './utils/PropertyAccessModal.jsx';
import Pagination from '../../common/Pagination.jsx';

const LIMIT = 10;
const IS_ACTIVE_OPTIONS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
];

const Users = () => {
  const dispatch = useDispatch();

  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [search, setSearch]     = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage]         = useState(1);

  const [formModal, setFormModal]           = useState({ open: false, mode: 'CREATE', user: null });
  const [resetModal, setResetModal]         = useState({ open: false, user: null });
  const [accessModal, setAccessModal]       = useState({ open: false, user: null });

  const debounceRef = useRef(null);

  const fetchList = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    const result = await dispatch(
      listUsers({
        search:   params.search   || undefined,
        isActive: params.isActive !== '' ? params.isActive : undefined,
        page:     params.page,
        limit:    LIMIT,
      })
    );
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load users.');
  }, [dispatch]);

  useEffect(() => { fetchList({ search, isActive, page }); }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchList({ search: val, isActive, page: 1 }); }, 400);
  };

  const handleIsActiveChange = (val) => { setIsActive(val); setPage(1); fetchList({ search, isActive: val, page: 1 }); };
  const handlePageChange     = (p)   => { setPage(p); fetchList({ search, isActive, page: p }); };
  const handleReset          = ()    => { setSearch(''); setIsActive(''); setPage(1); fetchList({ search: '', isActive: '', page: 1 }); };
  const handleSuccess        = ()    => fetchList({ search, isActive, page });

  const openCreate = () => setFormModal({ open: true, mode: 'CREATE', user: null });

  const openEdit = async (row) => {
    const full = await dispatch(getUserById(row.id));
    setFormModal({ open: true, mode: 'EDIT', user: full || row });
  };

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Users</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage system users and property access
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 self-start sm:self-auto"
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
          <IconPlus size={16} /> Add User
        </button>
      </div>

      {/* Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--surface-border)' }}>
          <div className="relative flex-1 max-w-xs">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--surface-border)')} />
          </div>
          <select value={isActive} onChange={e => handleIsActiveChange(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            {IS_ACTIVE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <IconRefresh size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        <UserTable
          data={data} loading={loading} error={error} page={page} limit={LIMIT}
          onEdit={openEdit}
          onResetPassword={row => setResetModal({ open: true, user: row })}
          onPropertyAccess={row => setAccessModal({ open: true, user: row })}
          onRefetch={handleSuccess}
        />

        {/* Pagination */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <Pagination currentPage={page} totalPages={meta.totalPages} totalItems={meta.total}
              itemsPerPage={LIMIT} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={formModal.open} mode={formModal.mode} selected={formModal.user}
        onClose={() => setFormModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      <ResetPasswordModal
        isOpen={resetModal.open} user={resetModal.user}
        onClose={() => setResetModal(p => ({ ...p, open: false }))} />

      <PropertyAccessModal
        isOpen={accessModal.open} user={accessModal.user}
        onClose={() => setAccessModal(p => ({ ...p, open: false }))} />
    </div>
  );
};

export default Users;