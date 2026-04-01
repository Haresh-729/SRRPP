import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconPlus, IconRefresh, IconFileText, IconCheck, IconAlertTriangle, IconBan } from '@tabler/icons-react';
import { listAgreements } from '../../../services/repository/AgreementRepo.js';
import { getPropertySummary } from '../../../services/repository/PropertyRepo.js';
import { getTenantSummary } from '../../../services/repository/TenantRepo.js';
import { selectAccount } from '../../../app/DashboardSlice.js';
import { normalizeRole, ROLE_CODES } from '../../../services/utils/rbac.js';
import AgreementTable from './utils/AgreementTable.jsx';
import AgreementCreateModal from './utils/AgreementCreateModal.jsx';
import AgreementDetailDrawer from './utils/AgreementDetailDrawer.jsx';
import TerminateModal from './utils/TerminateModal.jsx';
import UpdatePdfModal from './utils/UpdatePdfModal.jsx';
import Pagination from '../../common/Pagination.jsx';

const LIMIT = 10;
const STATUS_OPTIONS = [
  { label: 'All Status',  value: '' },
  { label: 'Active',      value: 'ACTIVE' },
  { label: 'Expired',     value: 'EXPIRED' },
  { label: 'Terminated',  value: 'TERMINATED' },
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

const Agreements = () => {
  const dispatch = useDispatch();
  const account  = useSelector(selectAccount);
  const isAdmin  = normalizeRole(account?.roleCode || account?.role) === ROLE_CODES.ADMIN;

  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [status,     setStatus]     = useState('ACTIVE');
  const [propertyId, setPropertyId] = useState('');
  const [tenantId,   setTenantId]   = useState('');
  const [page,       setPage]       = useState(1);

  const [properties, setProperties] = useState([]);
  const [tenants,    setTenants]    = useState([]);

  const [createModal,    setCreateModal]    = useState(false);
  const [drawer,         setDrawer]         = useState({ open: false, id: null });
  const [terminateModal, setTerminateModal] = useState({ open: false, id: null });
  const [pdfModal,       setPdfModal]       = useState({ open: false, id: null, pdf: null });

  const fetchList = useCallback(async (params) => {
    setLoading(true); setError(null);
    const result = await dispatch(listAgreements({
      status:     params.status     || undefined,
      propertyId: params.propertyId || undefined,
      tenantId:   params.tenantId   || undefined,
      page:       params.page,
      limit:      LIMIT,
    }));
    setLoading(false);
    if (result) { setData(result.data); setMeta(result.meta); }
    else setError('Failed to load agreements.');
  }, [dispatch]);

  useEffect(() => {
    fetchList({ status, propertyId, tenantId, page });
    dispatch(getPropertySummary()).then(r => { if (r && Array.isArray(r)) setProperties(r); });
    dispatch(getTenantSummary()).then(r => { if (r && Array.isArray(r)) setTenants(r); });
  }, []);

  const applyFilter = (field, val) => {
    const next = { status, propertyId, tenantId, page: 1 };
    next[field] = val;
    if (field === 'status')     setStatus(val);
    if (field === 'propertyId') setPropertyId(val);
    if (field === 'tenantId')   setTenantId(val);
    setPage(1);
    fetchList(next);
  };

  const handleReset  = () => { setStatus(''); setPropertyId(''); setTenantId(''); setPage(1); fetchList({ status: '', propertyId: '', tenantId: '', page: 1 }); };
  const handlePageChange = (p) => { setPage(p); fetchList({ status, propertyId, tenantId, page: p }); };
  const handleSuccess    = () => fetchList({ status, propertyId, tenantId, page });

  const handlePdf = (row) => {
    if (row.agreement_pdf) window.open(row.agreement_pdf, '_blank');
    else setPdfModal({ open: true, id: row.id, pdf: null });
  };

  // Stats from current page data
  const total      = meta.total;
  const activeC    = data.filter(r => r.status === 'ACTIVE').length;
  const expiredC   = data.filter(r => r.status === 'EXPIRED').length;
  const terminatedC = data.filter(r => r.status === 'TERMINATED').length;

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Agreements</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage rental agreements</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-85 self-start sm:self-auto"
          style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
          <IconPlus size={16} /> New Agreement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={IconFileText}      label="Total"      value={total}       color="var(--brand-primary)" />
        <StatCard icon={IconCheck}         label="Active"     value={activeC}     color="var(--success)" />
        <StatCard icon={IconAlertTriangle} label="Expired"    value={expiredC}    color="var(--warning)" />
        <StatCard icon={IconBan}           label="Terminated" value={terminatedC} color="var(--danger)" />
      </div>

      {/* Card */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <select value={status} onChange={e => applyFilter('status', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={propertyId} onChange={e => applyFilter('propertyId', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={tenantId} onChange={e => applyFilter('tenantId', e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}>
            <option value="">All Tenants</option>
            {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName || t.full_name}</option>)}
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
        <AgreementTable
          data={data} loading={loading} error={error} page={page} limit={LIMIT} isAdmin={isAdmin}
          onView={row => setDrawer({ open: true, id: row.id })}
          onPdf={handlePdf}
          onTerminate={row => setTerminateModal({ open: true, id: row.id })}
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
      <AgreementCreateModal isOpen={createModal} onClose={() => setCreateModal(false)} onSuccess={handleSuccess} />

      <AgreementDetailDrawer
        isOpen={drawer.open} agreementId={drawer.id}
        onClose={() => setDrawer(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      <TerminateModal
        isOpen={terminateModal.open} agreementId={terminateModal.id}
        onClose={() => setTerminateModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />

      <UpdatePdfModal
        isOpen={pdfModal.open} agreementId={pdfModal.id} existingPdf={pdfModal.pdf}
        onClose={() => setPdfModal(p => ({ ...p, open: false }))} onSuccess={handleSuccess} />
    </div>
  );
};

export default Agreements;