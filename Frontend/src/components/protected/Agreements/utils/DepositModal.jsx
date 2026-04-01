import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload } from '@tabler/icons-react';
import { updateAgreementDeposit } from '../../../../services/repository/AgreementRepo.js';

const MODES = ['CASH', 'CHEQUE', 'UPI'];

const DepositModal = ({ isOpen, mode, agreementId, depositAmount, existing, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const fileRef  = useRef(null);
  const [form, setForm]             = useState({ amount: '', receivedOn: '', paymentMode: 'CASH', chequeNumber: '', chequeDate: '', bankName: '', remarks: '' });
  const [photo, setPhoto]           = useState(null);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'UPDATE' && existing) {
      setForm({
        amount:       existing.amount             || depositAmount || '',
        receivedOn:   existing.received_on ? existing.received_on.split('T')[0] : '',
        paymentMode:  existing.payment_mode       || 'CASH',
        chequeNumber: existing.cheque_number      || '',
        chequeDate:   existing.cheque_date ? existing.cheque_date.split('T')[0] : '',
        bankName:     existing.bank_name          || '',
        remarks:      existing.remarks            || '',
      });
    } else {
      setForm({ amount: depositAmount || '', receivedOn: '', paymentMode: 'CASH', chequeNumber: '', chequeDate: '', bankName: '', remarks: '' });
    }
    setPhoto(null); setErrors({});
  }, [isOpen, mode, existing, depositAmount]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter valid amount.';
    if (!form.receivedOn) e.receivedOn = 'Date is required.';
    if (!form.paymentMode) e.paymentMode = 'Select payment mode.';
    if (form.paymentMode === 'CHEQUE') {
      if (!form.chequeNumber.trim()) e.chequeNumber = 'Required for cheque.';
      if (!form.chequeDate) e.chequeDate = 'Required for cheque.';
      if (!form.bankName.trim()) e.bankName = 'Required for cheque.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('amount',      form.amount);
    fd.append('receivedOn',  form.receivedOn);
    fd.append('paymentMode', form.paymentMode);
    if (form.paymentMode === 'CHEQUE') {
      fd.append('chequeNumber', form.chequeNumber);
      fd.append('chequeDate',   form.chequeDate);
      fd.append('bankName',     form.bankName);
      if (photo) fd.append('chequePhoto', photo);
    }
    if (form.remarks.trim()) fd.append('remarks', form.remarks);
    const result = await dispatch(updateAgreementDeposit(agreementId, fd));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  const inp = (f) => ({
    className: 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none',
    style: { borderColor: errors[f] ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' },
    onFocus: ev => !errors[f] && (ev.target.style.borderColor = 'var(--brand-primary)'),
    onBlur: ev => !errors[f] && (ev.target.style.borderColor = 'var(--surface-border)'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'UPDATE' ? 'Edit Deposit Payment' : 'Record Deposit Payment'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} min="0" {...inp('amount')} />
                {errors.amount && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Received On <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="date" value={form.receivedOn} onChange={e => set('receivedOn', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                  style={{ borderColor: errors.receivedOn ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                {errors.receivedOn && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.receivedOn}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                Payment Mode <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div className="flex gap-3">
                {MODES.map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.paymentMode === m} onChange={() => set('paymentMode', m)} />
                    <span className="text-sm" style={{ color: 'var(--text-main)' }}>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            {form.paymentMode === 'CHEQUE' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque No <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="text" value={form.chequeNumber} onChange={e => set('chequeNumber', e.target.value)} {...inp('chequeNumber')} />
                    {errors.chequeNumber && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.chequeNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="date" value={form.chequeDate} onChange={e => set('chequeDate', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                      style={{ borderColor: errors.chequeDate ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                    {errors.chequeDate && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.chequeDate}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Bank Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="text" value={form.bankName} onChange={e => set('bankName', e.target.value)} {...inp('bankName')} />
                  {errors.bankName && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Photo</label>
                  {mode === 'UPDATE' && existing?.cheque_photo && !photo && (
                    <a href={existing.cheque_photo} target="_blank" rel="noopener noreferrer"
                      className="text-xs block mb-2 hover:underline" style={{ color: 'var(--brand-primary)' }}>View existing photo</a>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={e => setPhoto(e.target.files?.[0] || null)} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <IconUpload size={14} /> {photo ? photo.name : 'Upload Photo'}
                  </button>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Remarks</label>
              <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} maxLength={500}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={onClose} disabled={submitting}
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
      </div>
    </div>
  );
};

export default DepositModal;