import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconPlus, IconLoader2, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { apiConnector } from '../../../../services/Connector.js';
import { propertyEndpoints } from '../../../../services/Apis.js';
import {
  getPropertyAccess,
  assignPropertyAccess,
} from '../../../../services/repository/UserAccessRepo.js';
import PropertyAccessTable from './PropertyAccessTable.jsx';

const PropertyAccessModal = ({ isOpen, user, onClose }) => {
  const dispatch = useDispatch();
  const [accessList, setAccessList]       = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [properties, setProperties]       = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ propertyId: '', validFrom: '', validTo: '' });
  const [errors, setErrors]               = useState({});
  const [assigning, setAssigning]         = useState(false);

  const fetchAccess = async () => {
    setAccessLoading(true);
    const result = await dispatch(getPropertyAccess(user.id));
    setAccessLoading(false);
    if (result) setAccessList(result);
  };

  const fetchProperties = async () => {
    try {
      const res = await apiConnector(propertyEndpoints.SUMMARY.type, propertyEndpoints.SUMMARY.url);
      if (res.data.success) setProperties(res.data.data.filter(p => p.isActive));
    } catch (_) {}
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchAccess();
    fetchProperties();
    setShowForm(false);
    setForm({ propertyId: '', validFrom: '', validTo: '' });
    setErrors({});
  }, [isOpen, user]);

  const validate = () => {
    const e = {};
    if (!form.propertyId) e.propertyId = 'Select a property.';
    if (!form.validFrom) e.validFrom = 'Valid From is required.';
    if (!form.validTo) e.validTo = 'Valid To is required.';
    else if (form.validFrom && form.validTo && form.validTo <= form.validFrom) e.validTo = 'Valid To must be after Valid From.';
    return e;
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setAssigning(true);
    const result = await dispatch(assignPropertyAccess(user.id, form.propertyId, form.validFrom, form.validTo));
    setAssigning(false);
    if (result) {
      setShowForm(false);
      setForm({ propertyId: '', validFrom: '', validTo: '' });
      setErrors({});
      fetchAccess();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            Property Access — <span style={{ color: 'var(--brand-primary)' }}>{user.name}</span>
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}>
            <IconX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Assign Form Toggle */}
          <div className="px-6 pt-4 pb-2">
            <button type="button" onClick={() => setShowForm(v => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
              <IconPlus size={15} />
              Assign Property
              {showForm ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
            </button>
          </div>

          {/* Assign Form */}
          {showForm && (
            <form onSubmit={handleAssign}
              className="mx-6 mb-4 p-4 rounded-xl border"
              style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Property */}
                <div className="sm:col-span-3 md:col-span-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                    Property <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <select value={form.propertyId}
                    onChange={e => { setForm(p => ({ ...p, propertyId: e.target.value })); if (errors.propertyId) setErrors(p => ({ ...p, propertyId: undefined })); }}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.propertyId ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-card)', color: 'var(--text-main)' }}>
                    <option value="">Select property...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.address}</option>
                    ))}
                  </select>
                  {errors.propertyId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.propertyId}</p>}
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                    Valid From <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="date" value={form.validFrom}
                    onChange={e => { setForm(p => ({ ...p, validFrom: e.target.value })); if (errors.validFrom) setErrors(p => ({ ...p, validFrom: undefined })); }}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none date-input"
                    style={{ borderColor: errors.validFrom ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-card)', color: 'var(--text-main)' }} />
                  {errors.validFrom && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.validFrom}</p>}
                </div>

                {/* Valid To */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                    Valid To <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="date" value={form.validTo}
                    onChange={e => { setForm(p => ({ ...p, validTo: e.target.value })); if (errors.validTo) setErrors(p => ({ ...p, validTo: undefined })); }}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none date-input"
                    style={{ borderColor: errors.validTo ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-card)', color: 'var(--text-main)' }} />
                  {errors.validTo && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.validTo}</p>}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="submit" disabled={assigning}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                  {assigning && <IconLoader2 size={14} className="animate-spin" />}
                  {assigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="mx-6 mb-2 border-t" style={{ borderColor: 'var(--surface-border)' }} />

          {/* Access Table */}
          <div className="px-0 pb-4">
            <PropertyAccessTable
              data={accessList}
              loading={accessLoading}
              onRefetch={fetchAccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAccessModal;