import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconPlus, IconSearch, IconRefresh, IconBuildingSkyscraper, IconKey, IconHome, IconCheck } from '@tabler/icons-react';
import { listProperties, getPropertySummary } from '../../../services/repository/PropertyRepo.js';
import { listActivePropertyTypes } from '../../../services/repository/PropertyTypeRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../services/utils/rbac.js';
import PropertyTable from './utils/PropertyTable.jsx';
import PropertyFormModal from './utils/PropertyFormModal.jsx';
import PropertyDetailDrawer from './utils/PropertyDetailDrawer.jsx';
import Pagination from '../../common/Pagination.jsx';

const LIMIT = 10;
const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Vacant',     value: 'VACANT' },
  { label: 'Rented',     value: 'RENTED' },
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

const Properties = () => {
  const dispatch  = useDispatch();
  const account   = useSelector(selectAccount);
  const isAdmin   = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [data, setData]         = useState([]);
  const [meta, setMeta]         = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary]   = useState(null);
  const [propTypes, setPropTypes] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState('');
  const [propertyTypeId, setTypeId]   = useState('');
  const [isActive, setIsActive]       = useState('');
  const [page, setPage]               = useState(1);

  const [formModal, setFormModal]   = useState({ open: false, mode: 'CREATE', id: null });
  const [drawer, setDrawer]         = useState({ open: false, id: null });

  const debounceRef = useRef(null);

  // Fetch property types for filter dropdown
  useEffect(() => {
    dispatch(listActivePropertyTypes()).then(res => { if (res) setPropTypes(res); });
  }, []);

  const fetchSummary = useCallback(async () => {
    const res = await dispatch(getPropertySummary());
    if (res) setSummary(res);
  }, [dispatch]);

  const fetchList = useCallback(async (params) => {
    setLoading(true); setError(null);
    const result = await dispatch(listProperties({
      search:         params.search       || undefined,
      status:         params.status       || undefined,
      propertyTypeId: params.propertyTypeId || undefined,
      isActive:       params.isActive !== '' ? params.isActive : undefined,
      page:           params.page,
      limit:          LIMIT,
    }));
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load properties.');
  }, [dispatch]);

  useEffect(() => {
    fetchList({ search, status, propertyTypeId, isActive, page });
    fetchSummary();
  }, []);

  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchList({ search: val, status, propertyTypeId, isActive, page: 1 }); }, 400);
  };

  const applyFilter = (field, val) => {
    const next = { search, status, propertyTypeId, isActive, page: 1 };
    next[field] = val;
    if (field === 'status')         setStatus(val);
    if (field === 'propertyTypeId') setTypeId(val);
    if (field === 'isActive')       setIsActive(val);
    setPage(1);
    fetchList(next);
  };

  const handleReset = () => {
    setSearch(''); setStatus(''); setTypeId(''); setIsActive(''); setPage(1);
    fetchList({ search: '', status: '', propertyTypeId: '', isActive: '', page: 1 });
  };

  const handlePageChange = (p) => { setPage(p); fetchList({ search, status, propertyTypeId, isActive, page: p }); };
  const handleSuccess    = ()    => { fetchList({ search, status, propertyTypeId, isActive, page }); fetchSummary(); };

  // Stats derived from summary + list data
  const total   = meta.total       ?? 0;
  const rented  = data.filter(p => p.status === 'RENTED').length;
  const vacant  = data.filter(p => p.status === 'VACANT').length;
  const active  = data.filter(p => p.isActive).length;

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Properties</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage your property portfolio</p>
        </div>
        {isAdmin && (
          <button onClick={() => setFormModal({ open: true, mode: 'CREATE', id: null })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 self-start sm:self-auto"
            style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
            <IconPlus size={16} /> Add Property
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={IconBuildingSkyscraper} label="Total"  value={total}  color="var(--brand-primary)" />
        <StatCard icon={IconKey}                label="Rented" value={rented} color="var(--success)" />
        <StatCard icon={IconHome}               label="Vacant" value={vacant} color="var(--warning)" />
        <StatCard icon={IconCheck}              label="Active" value={active} color="var(--accent)" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--surface-border)')} />
          </div>

          {/* Status */}
          <select value={status} onChange={e => applyFilter('status', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Property Type */}
          <select value={propertyTypeId} onChange={e => applyFilter('propertyTypeId', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            <option value="">All Types</option>
            {propTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
          </select>

          {/* isActive (ADMIN only) */}
          {isAdmin && (
            <select value={isActive} onChange={e => applyFilter('isActive', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}

          {/* Reset */}
          <button onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
            <IconRefresh size={14} /> Reset
          </button>
        </div>

        {/* Table */}
        <PropertyTable
          data={data} loading={loading} error={error} page={page} limit={LIMIT} isAdmin={isAdmin}
          onEdit={row => setFormModal({ open: true, mode: 'EDIT', id: row.id })}
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
      <PropertyFormModal
        isOpen={formModal.open} mode={formModal.mode} propertyId={formModal.id}
        onClose={() => setFormModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      {/* Detail Drawer */}
      <PropertyDetailDrawer
        isOpen={drawer.open} propertyId={drawer.id}
        onClose={() => setDrawer(p => ({ ...p, open: false }))}
        onEdit={row => { setDrawer(p => ({ ...p, open: false })); setFormModal({ open: true, mode: 'EDIT', id: row.id }); }}
      />
    </div>
  );
};

export default Properties;