import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { createUser, updateUser } from '../../../../services/repository/UserAccessRepo.js';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const UserFormModal = ({ isOpen, mode, selected, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', password: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'EDIT' && selected) {
      setForm({ name: selected.name || '', email: selected.email || '', password: '', isActive: selected.isActive ?? true });
    } else {
      setForm({ name: '', email: '', password: '', isActive: true });
    }
    setErrors({});
    setIsDirty(false);
    setShowPwd(false);
  }, [isOpen, mode, selected]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    else if (form.name.trim().length < 2) e.name = 'Min 2 characters.';
    else if (form.name.trim().length > 255) e.name = 'Max 255 characters.';
    if (mode === 'CREATE') {
      if (!form.email.trim()) e.email = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format.';
      if (!form.password) e.password = 'Password is required.';
      else if (!PWD_REGEX.test(form.password)) e.password = 'Min 8 chars with uppercase, lowercase, number & special character.';
    }
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
    const result = mode === 'CREATE'
      ? await dispatch(createUser(form.name.trim(), form.email.trim(), form.password))
      : await dispatch(updateUser(selected.id, { name: form.name.trim(), isActive: form.isActive }));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'CREATE' ? 'Add User' : 'Edit User'}
          </h3>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <IconX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Raj Sharma" maxLength={255}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: errors.name ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
                onFocus={e => !errors.name && (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => !errors.name && (e.target.style.borderColor = 'var(--surface-border)')}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
            </div>

            {/* Email — CREATE only */}
            {mode === 'CREATE' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Email <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: errors.email ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
                  onFocus={e => !errors.email && (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={e => !errors.email && (e.target.style.borderColor = 'var(--surface-border)')}
                />
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>}
              </div>
            )}

            {/* Password — CREATE only */}
            {mode === 'CREATE' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none"
                    style={{ borderColor: errors.password ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
                    onFocus={e => !errors.password && (e.target.style.borderColor = 'var(--brand-primary)')}
                    onBlur={e => !errors.password && (e.target.style.borderColor = 'var(--surface-border)')}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {showPwd ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password}</p>}
              </div>
            )}

            {/* Is Active — EDIT only */}
            {mode === 'EDIT' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Active</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inactive users cannot log in</p>
                </div>
                <button type="button" onClick={() => set('isActive', !form.isActive)}
                  className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ backgroundColor: form.isActive ? 'var(--brand-primary)' : 'var(--surface-border)' }}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{ transform: form.isActive ? 'translateX(-1px)' : 'translateX(-20px)' }} />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={handleClose} disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
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

export default UserFormModal;