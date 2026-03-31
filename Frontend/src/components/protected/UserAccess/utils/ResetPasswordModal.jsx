import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconEye, IconEyeOff } from '@tabler/icons-react';
import { resetUserPassword } from '../../../../services/repository/UserAccessRepo.js';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const ResetPasswordModal = ({ isOpen, user, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setShowNew(false);
    setShowConfirm(false);
  }, [isOpen]);

  const validate = () => {
    const e = {};
    if (!newPassword) e.newPassword = 'Password is required.';
    else if (!PWD_REGEX.test(newPassword)) e.newPassword = 'Min 8 chars with uppercase, lowercase, number & special character.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const ok = await dispatch(resetUserPassword(user.id, newPassword));
    setSubmitting(false);
    if (ok) { onSuccess?.(); onClose(); }
  };

  if (!isOpen || !user) return null;

  const field = (label, value, onChange, show, setShow, error, placeholder) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
        {label} <span style={{ color: 'var(--danger)' }}>*</span>
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'} value={value} onChange={e => { onChange(e.target.value); if (error) setErrors(p => ({ ...p })); }}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none"
          style={{ borderColor: error ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }}
          onFocus={ev => !error && (ev.target.style.borderColor = 'var(--brand-primary)')}
          onBlur={ev => !error && (ev.target.style.borderColor = 'var(--surface-border)')}
        />
        <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
          {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            Reset Password — <span style={{ color: 'var(--brand-primary)' }}>{user.name}</span>
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            <IconX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {field('New Password', newPassword, setNewPassword, showNew, setShowNew, errors.newPassword, '••••••••')}
            {field('Confirm New Password', confirmPassword, setConfirmPassword, showConfirm, setShowConfirm, errors.confirmPassword, '••••••••')}
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;