import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconAlertTriangle } from '@tabler/icons-react';
import { terminateAgreement } from '../../../../services/repository/AgreementRepo.js';

const TerminateModal = ({ isOpen, agreementId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [reason, setReason]         = useState('');
  const [error, setError]           = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!isOpen) { setReason(''); setError(''); } }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) { setError('Reason is required.'); return; }
    if (reason.trim().length < 5) { setError('Min 5 characters.'); return; }
    setSubmitting(true);
    const result = await dispatch(terminateAgreement(agreementId, reason.trim()));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Terminate Agreement</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ backgroundColor: 'rgba(232,160,32,0.08)', borderColor: 'rgba(232,160,32,0.3)' }}>
              <IconAlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
              <p className="text-sm" style={{ color: 'var(--text-main)' }}>
                Terminating this agreement will mark the property as <strong>VACANT</strong> and cannot be undone.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Termination Reason <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea value={reason} onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="Reason for early termination..." maxLength={1000} rows={4}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{
                  borderColor: error ? 'var(--danger)' : 'var(--surface-border)',
                  backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)',
                }}
                onFocus={e => !error && (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => !error && (e.target.style.borderColor = 'var(--surface-border)')} />
              {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{reason.length}/1000</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t"
            style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Terminating...' : 'Terminate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminateModal;