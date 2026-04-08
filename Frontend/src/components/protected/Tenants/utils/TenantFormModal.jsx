import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload, IconTrash, IconPhoto } from '@tabler/icons-react';
import { createTenant, updateTenant, deleteTenantDocument, getTenantById } from '../../../../services/repository/TenantRepo.js';

const today = new Date().toISOString().split('T')[0];

const DocField = ({ label, required, existing, newFile, onPickNew, onRemoveExisting, removing }) => {
  const fileRef = useRef(null);
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      {/* Existing thumbnail */}
      {existing && !newFile && (
        <div className="flex items-center gap-3 mb-2 p-3 rounded-xl border"
          style={{ backgroundColor: 'var(--surface-bg)', borderColor: 'var(--surface-border)' }}>
          <a href={existing} target="_blank" rel="noopener noreferrer">
            <img src={existing} alt={label} className="w-16 h-12 object-cover rounded-lg border hover:opacity-80"
              style={{ borderColor: 'var(--surface-border)' }} />
          </a>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium" style={{ color: 'var(--text-main)' }}>Current document</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click to view full size</p>
          </div>
          <button type="button" onClick={onRemoveExisting} disabled={removing}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'rgba(217,48,37,0.1)', color: 'var(--danger)' }}>
            {removing ? <IconLoader2 size={12} className="animate-spin" /> : <IconTrash size={12} />}
            Remove
          </button>
        </div>
      )}
      {/* File picker */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={e => onPickNew(e.target.files?.[0] || null)} className="hidden" />
      <button type="button" onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed text-sm w-full justify-center transition-colors"
        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--surface-border)')}>
        <IconUpload size={15} />
        {newFile ? newFile.name : existing ? 'Replace with new file' : 'Upload JPG/PNG (max 5MB)'}
      </button>
      {newFile && (
        <div className="flex items-center gap-2 mt-1">
          <IconPhoto size={12} style={{ color: 'var(--brand-primary)' }} />
          <p className="text-xs" style={{ color: 'var(--brand-primary)' }}>New file selected: {newFile.name}</p>
          <button type="button" onClick={() => onPickNew(null)} className="text-xs ml-auto" style={{ color: 'var(--danger)' }}>Clear</button>
        </div>
      )}
    </div>
  );
};

const TenantFormModal = ({ isOpen, mode, selectedId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ fullName: '', email: '', whatsAppNo: '', dob: '', permanentAddress: '', isActive: true });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const [existingAadhar, setExistingAadhar] = useState(null);
  const [existingPan,    setExistingPan]    = useState(null);
  const [newAadhar, setNewAadhar]           = useState(null);
  const [newPan,    setNewPan]              = useState(null);
  const [removingAadhar, setRemovingAadhar] = useState(false);
  const [removingPan,    setRemovingPan]    = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({}); setIsDirty(false); setNewAadhar(null); setNewPan(null);
    if (mode === 'CREATE') {
      setForm({ fullName: '', email: '', whatsAppNo: '', dob: '', permanentAddress: '', isActive: true });
      setExistingAadhar(null); setExistingPan(null);
    } else if (mode === 'EDIT' && selectedId) {
      setLoading(true);
      dispatch(getTenantById(selectedId)).then(r => {
        if (r) {
          setForm({
            fullName:         r.fullName || r.full_name || '',
            email:            r.email || '',
            whatsAppNo:       r.whatsAppNo || r.whats_app_no || '',
            dob:              r.dob ? r.dob.split('T')[0] : '',
            permanentAddress: r.permanentAddress || r.permanent_address || '',
            isActive:         r.isActive ?? r.is_active ?? true,
          });
          setExistingAadhar(r.aadharPhoto || r.aadhar_photo || null);
          setExistingPan(r.panPhoto || r.pan_photo || null);
        }
        setLoading(false);
      });
    }
  }, [isOpen, mode, selectedId]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setIsDirty(true); if (errors[f]) setErrors(p => ({ ...p, [f]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Min 2 characters required.';
    if (form.fullName.trim().length > 255) e.fullName = 'Max 255 characters.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required.';
    if (!form.whatsAppNo.trim() || !/^[6-9]\d{9}$/.test(form.whatsAppNo.trim())) e.whatsAppNo = 'Valid 10-digit Indian number required.';
    if (!form.dob) e.dob = 'Date of birth required.';
    else if (form.dob >= today) e.dob = 'DOB cannot be today or in the future.';
    if (!form.permanentAddress.trim() || form.permanentAddress.trim().length < 5) e.permanentAddress = 'Min 5 characters required.';
    if (form.permanentAddress.trim().length > 1000) e.permanentAddress = 'Max 1000 characters.';
    if (mode === 'CREATE') {
      if (!newAadhar) e.aadhar = 'Aadhar photo required.';
      if (!newPan)    e.pan    = 'PAN photo required.';
    }
    return e;
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Unsaved changes. Close anyway?')) return;
    onClose();
  };

  const handleRemoveAadhar = async () => {
    if (!window.confirm('Remove Aadhar document? This cannot be undone.')) return;
    setRemovingAadhar(true);
    const ok = await dispatch(deleteTenantDocument(selectedId, 'aadhar'));
    setRemovingAadhar(false);
    if (ok) setExistingAadhar(null);
  };

  const handleRemovePan = async () => {
    if (!window.confirm('Remove PAN document? This cannot be undone.')) return;
    setRemovingPan(true);
    const ok = await dispatch(deleteTenantDocument(selectedId, 'pan'));
    setRemovingPan(false);
    if (ok) setExistingPan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('fullName',         form.fullName.trim());
    fd.append('email',            form.email.trim());
    fd.append('whatsAppNo',       form.whatsAppNo.trim());
    fd.append('dob',              form.dob);
    fd.append('permanentAddress', form.permanentAddress.trim());
    if (newAadhar) fd.append('aadharPhoto', newAadhar);
    if (newPan)    fd.append('panPhoto',    newPan);
    if (mode === 'EDIT') fd.append('isActive', form.isActive);

    const result = mode === 'CREATE'
      ? await dispatch(createTenant(fd))
      : await dispatch(updateTenant(selectedId, fd));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  const inp = (f) => ({
    className: 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none',
    style: { borderColor: errors[f] ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' },
    onFocus: ev => !errors[f] && (ev.target.style.borderColor = 'var(--brand-primary)'),
    onBlur:  ev => !errors[f] && (ev.target.style.borderColor = 'var(--surface-border)'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'CREATE' ? 'Add Tenant' : 'Edit Tenant'}
          </h3>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Row 1: Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                    Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="e.g. Ramesh Patil" maxLength={255} {...inp('fullName')} />
                  {errors.fullName && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                    Email <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="e.g. ramesh@example.com" {...inp('email')} />
                  {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
                </div>
              </div>

              {/* Row 2: WhatsApp + DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                    WhatsApp Number <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="tel" value={form.whatsAppNo}
                    onChange={e => set('whatsAppNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9876543210" maxLength={10} {...inp('whatsAppNo')} />
                  {errors.whatsAppNo && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.whatsAppNo}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                    Date of Birth <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="date" value={form.dob} max={today} onChange={e => set('dob', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                    style={{ borderColor: errors.dob ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                  {errors.dob && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.dob}</p>}
                </div>
              </div>

              {/* Permanent Address */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Permanent Address <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea value={form.permanentAddress} onChange={e => set('permanentAddress', e.target.value)}
                  placeholder="Full permanent address" maxLength={1000} rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: errors.permanentAddress ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                {errors.permanentAddress && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.permanentAddress}</p>}
              </div>

              {/* Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <DocField
                    label="Aadhar Card Photo" required={mode === 'CREATE'}
                    existing={existingAadhar} newFile={newAadhar}
                    onPickNew={f => { setNewAadhar(f); setIsDirty(true); if (errors.aadhar) setErrors(p => ({...p, aadhar: undefined})); }}
                    onRemoveExisting={handleRemoveAadhar} removing={removingAadhar} />
                  {errors.aadhar && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.aadhar}</p>}
                </div>
                <div>
                  <DocField
                    label="PAN Card Photo" required={mode === 'CREATE'}
                    existing={existingPan} newFile={newPan}
                    onPickNew={f => { setNewPan(f); setIsDirty(true); if (errors.pan) setErrors(p => ({...p, pan: undefined})); }}
                    onRemoveExisting={handleRemovePan} removing={removingPan} />
                  {errors.pan && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.pan}</p>}
                </div>
              </div>

              {/* Is Active — EDIT only */}
              {mode === 'EDIT' && (
                <div className="flex items-center justify-between p-4 rounded-xl border"
                  style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Active Status</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inactive tenants cannot be assigned to new agreements</p>
                  </div>
                  <button type="button" onClick={() => set('isActive', !form.isActive)}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ backgroundColor: form.isActive ? 'var(--brand-primary)' : 'var(--surface-border)' }}>
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: form.isActive ? 'translateX(-2px)' : 'translateX(-20px)' }} />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
              style={{ borderColor: 'var(--surface-border)' }}>
              <button type="button" onClick={handleClose} disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
                {submitting && <IconLoader2 size={14} className="animate-spin" />}
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TenantFormModal;