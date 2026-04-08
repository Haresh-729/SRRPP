import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2 } from '@tabler/icons-react';
import { createBroker, updateBroker } from '../../../../services/repository/BrokerRepo.js';

const BrokerFormModal = ({ isOpen, mode, selected, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const [form, setForm]         = useState({ name: '', contactNo: '', email: '', address: '', isActive: true });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty]   = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'EDIT' && selected) {
      setForm({
        name:      selected.name        || '',
        contactNo: selected.contact_no  || selected.contactNo || '',
        email:     selected.email       || '',
        address:   selected.address     || '',
        isActive:  selected.is_active   ?? selected.isActive ?? true,
      });
    } else {
      setForm({ name: '', contactNo: '', email: '', address: '', isActive: true });
    }
    setErrors({}); setIsDirty(false);
  }, [isOpen, mode, selected]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                e.name = 'Name is required.';
    else if (form.name.trim().length < 2) e.name = 'Min 2 characters.';
    else if (form.name.trim().length > 255) e.name = 'Max 255 characters.';
    if (!form.contactNo.trim())           e.contactNo = 'Contact number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.contactNo.trim())) e.contactNo = 'Enter valid 10-digit Indian mobile number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email format.';
    if (form.address.trim() && form.address.trim().length < 5) e.address = 'Min 5 characters if provided.';
    if (form.address.trim() && form.address.trim().length > 1000) e.address = 'Max 1000 characters.';
    return e;
  };

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setIsDirty(true);
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Unsaved changes. Close anyway?')) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const body = {
      name:      form.name.trim(),
      contactNo: form.contactNo.trim(),
      email:     form.email.trim() || undefined,
      address:   form.address.trim() || undefined,
    };
    if (mode === 'EDIT') body.isActive = form.isActive;
    const result = mode === 'CREATE'
      ? await dispatch(createBroker(body))
      : await dispatch(updateBroker(selected.id, body));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  const inputStyle = (field) => ({
    borderColor: errors[field] ? 'var(--danger)' : 'var(--surface-border)',
    backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)',
  });
  const focusBind = (field) => ({
    onFocus: e => !errors[field] && (e.target.style.borderColor = 'var(--brand-primary)'),
    onBlur:  e => !errors[field] && (e.target.style.borderColor = 'var(--surface-border)'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'CREATE' ? 'Add Broker' : 'Edit Broker'}
          </h3>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Suresh Mehta" maxLength={255}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle('name')} {...focusBind('name')} />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Contact Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="tel" value={form.contactNo} onChange={e => set('contactNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="e.g. 9876543210" maxLength={10}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle('contactNo')} {...focusBind('contactNo')} />
              {errors.contactNo && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.contactNo}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="e.g. broker@example.com"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputStyle('email')} {...focusBind('email')} />
              {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Address</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Broker's office address" maxLength={1000} rows={3}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={inputStyle('address')} {...focusBind('address')} />
              {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.address}</p>}
            </div>

            {/* Is Active — EDIT only */}
            {mode === 'EDIT' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Active</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inactive brokers won't appear in agreement creation</p>
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
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrokerFormModal;