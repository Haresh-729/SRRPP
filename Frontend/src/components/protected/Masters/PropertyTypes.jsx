import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconPlus, IconSearch, IconRefresh } from '@tabler/icons-react';
import {
  listPropertyTypes,
  getPropertyTypeById,
} from '../../../services/repository/PropertyTypeRepo.js';
import PropertyTypeTable from './utils/PropertyTypeTable.jsx';
import PropertyTypeFormModal from './utils/PropertyTypeFormModal.jsx';
import Pagination from '../../common/Pagination.jsx';

const LIMIT = 10;

const IS_ACTIVE_OPTIONS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
];

const PropertyTypes = () => {
  const dispatch = useDispatch();

  // ── List state ────────────────────────────────────────────────────────────
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, page: 1, limit: LIMIT, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch]     = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage]         = useState(1);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState('CREATE');
  const [selected, setSelected]     = useState(null);

  // ── Debounce ref ──────────────────────────────────────────────────────────
  const debounceRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchList = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    const result = await dispatch(
      listPropertyTypes({
        search:   params.search   || undefined,
        isActive: params.isActive !== '' ? params.isActive : undefined,
        page:     params.page,
        limit:    LIMIT,
      })
    );
    setLoading(false);
    if (result) {
      setData(result.data);
      setMeta(result.meta);
    } else {
      setError('Failed to load property types.');
    }
  }, [dispatch]);

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchList({ search, isActive, page });
  }, []);

  // ── Search debounce ───────────────────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchList({ search: val, isActive, page: 1 });
    }, 400);
  };

  // ── isActive filter ───────────────────────────────────────────────────────
  const handleIsActiveChange = (val) => {
    setIsActive(val);
    setPage(1);
    fetchList({ search, isActive: val, page: 1 });
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const handlePageChange = (p) => {
    setPage(p);
    fetchList({ search, isActive, page: p });
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSearch('');
    setIsActive('');
    setPage(1);
    fetchList({ search: '', isActive: '', page: 1 });
  };

  // ── Open CREATE modal ─────────────────────────────────────────────────────
  const openCreate = () => {
    setSelected(null);
    setModalMode('CREATE');
    setModalOpen(true);
  };

  // ── Open EDIT modal — fetch latest by id first ────────────────────────────
  const openEdit = async (row) => {
    const full = await dispatch(getPropertyTypeById(row.id));
    setSelected(full || row);
    setModalMode('EDIT');
    setModalOpen(true);
  };

  // ── After CRUD success ────────────────────────────────────────────────────
  const handleSuccess = () => {
    fetchList({ search, isActive, page });
  };

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>
            Property Types
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage property type masters
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 self-start sm:self-auto"
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}
        >
          <IconPlus size={16} />
          Add Property Type
        </button>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}
      >
        {/* ── Filters Row ────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <IconSearch
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none transition-colors"
              style={{
                borderColor: 'var(--surface-border)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-main)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--surface-border)')}
            />
          </div>

          {/* isActive */}
          <select
            value={isActive}
            onChange={(e) => handleIsActiveChange(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: 'var(--surface-border)',
              backgroundColor: 'var(--surface-bg)',
              color: 'var(--text-main)',
            }}
          >
            {IS_ACTIVE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <IconRefresh size={14} />
            Reset
          </button>
        </div>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <PropertyTypeTable
          data={data}
          loading={loading}
          error={error}
          page={page}
          limit={LIMIT}
          onEdit={openEdit}
          onRefetch={handleSuccess}
        />

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {!loading && !error && meta.total > 0 && (
          <div
            className="px-5 py-4 border-t"
            style={{ borderColor: 'var(--surface-border)' }}
          >
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              itemsPerPage={LIMIT}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <PropertyTypeFormModal
        isOpen={modalOpen}
        mode={modalMode}
        selected={selected}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default PropertyTypes;