import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconPlus, IconSearch, IconRefresh, IconBriefcase, IconCheck, IconUsers } from '@tabler/icons-react';
import { listBrokers } from '../../../services/repository/BrokerRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../services/utils/rbac.js';
import BrokerTable from './utils/BrokerTable.jsx';
import BrokerFormModal from './utils/BrokerFormModal.jsx';
import BrokerDetailDrawer from './utils/BrokerDetailDrawer.jsx';
import Pagination from '../../common/Pagination.jsx';

const LIMIT = 10;
const IS_ACTIVE_OPTIONS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl border"
    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{value}</p>
    </div>
  </div>
);

const Brokers = () => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [search, setSearch]     = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage]         = useState(1);

  const [formModal, setFormModal] = useState({ open: false, mode: 'CREATE', selected: null });
  const [drawer, setDrawer]       = useState({ open: false, id: null });

  const debounceRef = useRef(null);

  const fetchList = useCallback(async (params) => {
    setLoading(true); setError(null);
    const result = await dispatch(listBrokers({
      search:   params.search   || undefined,
      isActive: params.isActive !== '' ? params.isActive : undefined,
      page:     params.page,
      limit:    LIMIT,
    }));
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load brokers.');
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

  const openEdit = (row) => {
    setDrawer({ open: false, id: null });
    setFormModal({ open: true, mode: 'EDIT', selected: row });
  };

  // Stats derived from list data
  const total       = meta.total ?? 0;
  const activeCount = data.filter(b => b.is_active ?? b.isActive).length;
  const totalAgs    = data.reduce((sum, b) => sum + (b._count?.agreements ?? 0), 0);

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Brokers</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage broker records</p>
        </div>
        {isAdmin && (
          <button onClick={() => setFormModal({ open: true, mode: 'CREATE', selected: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 self-start sm:self-auto"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
            <IconPlus size={16} /> Add Broker
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={IconBriefcase} label="Total Brokers"      value={total}       color="var(--brand-primary)" />
        <StatCard icon={IconCheck}     label="Active"             value={activeCount} color="var(--success)" />
        <StatCard icon={IconUsers}     label="Total Agreements"   value={totalAgs}    color="var(--accent)" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by name, contact, email..."
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
        <BrokerTable
          data={data} loading={loading} error={error} page={page} limit={LIMIT} isAdmin={isAdmin}
          onEdit={openEdit}
          onView={row => setDrawer({ open: true, id: row.id })}
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

      {/* Form Modal */}
      <BrokerFormModal
        isOpen={formModal.open} mode={formModal.mode} selected={formModal.selected}
        onClose={() => setFormModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      {/* Detail Drawer */}
      <BrokerDetailDrawer
        isOpen={drawer.open} brokerId={drawer.id}
        onClose={() => setDrawer(p => ({ ...p, open: false }))}
        onEdit={openEdit}
      />
    </div>
  );
};

export default Brokers;