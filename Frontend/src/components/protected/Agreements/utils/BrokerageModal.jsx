import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload } from '@tabler/icons-react';
import { updateAgreementBrokerage } from '../../../../services/repository/AgreementRepo.js';

const BrokerageModal = ({ isOpen, mode, agreementId, monthlyRent, existing, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const fileRef  = useRef(null);
  const [form, setForm]             = useState({
    brokerageType: 'PERCENTAGE', brokerageValue: '',
    isPaid: false, paidOn: '', paymentMode: 'CASH',
    chequeNumber: '', chequeDate: '', bankName: '', remarks: '',
  });
  const [photo, setPhoto]           = useState(null);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'UPDATE' && existing) {
      setForm({
        brokerageType: existing.brokerage_type  || 'PERCENTAGE',
        brokerageValue: existing.brokerage_value != null ? String(existing.brokerage_value) : '',
        isPaid:       existing.is_paid          ?? false,
        paidOn:       existing.paid_on ? existing.paid_on.split('T')[0] : '',
        paymentMode:  existing.payment_mode     || 'CASH',
        chequeNumber: existing.cheque_number    || '',
        chequeDate:   existing.cheque_date ? existing.cheque_date.split('T')[0] : '',
        bankName:     existing.bank_name        || '',
        remarks:      existing.remarks          || '',
      });
    } else {
      setForm({ brokerageType: 'PERCENTAGE', brokerageValue: '', isPaid: false, paidOn: '', paymentMode: 'CASH', chequeNumber: '', chequeDate: '', bankName: '', remarks: '' });
    }
    setPhoto(null); setErrors({});
  }, [isOpen, mode, existing]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: undefined })); };

  const calcAmount = () => {
    if (!form.brokerageValue || !monthlyRent) return null;
    if (form.brokerageType === 'PERCENTAGE') return ((Number(form.brokerageValue) / 100) * Number(monthlyRent)).toLocaleString('en-IN');
    return Number(form.brokerageValue).toLocaleString('en-IN');
  };

  const validate = () => {
    const e = {};
    if (!form.brokerageValue || isNaN(form.brokerageValue) || Number(form.brokerageValue) <= 0) e.brokerageValue = 'Enter valid value.';
    if (form.brokerageType === 'PERCENTAGE' && Number(form.brokerageValue) > 100) e.brokerageValue = 'Max 100%.';
    if (form.isPaid) {
      if (!form.paidOn) e.paidOn = 'Paid date required.';
      if (!form.paymentMode) e.paymentMode = 'Payment mode required.';
      if (form.paymentMode === 'CHEQUE') {
        if (!form.chequeNumber.trim()) e.chequeNumber = 'Required.';
        if (!form.chequeDate) e.chequeDate = 'Required.';
        if (!form.bankName.trim()) e.bankName = 'Required.';
      }
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('brokerageType',  form.brokerageType);
    fd.append('brokerageValue', form.brokerageValue);
    fd.append('brokerageIsPaid', form.isPaid);
    if (form.isPaid) {
      fd.append('brokeragePaidOn',       form.paidOn);
      fd.append('brokeragePaymentMode',  form.paymentMode);
      if (form.paymentMode === 'CHEQUE') {
        fd.append('brokerageChequeNumber', form.chequeNumber);
        fd.append('brokerageChequeDate',   form.chequeDate);
        fd.append('brokerageBankName',     form.bankName);
        if (photo) fd.append('brokerageChequePhoto', photo);
      }
    }
    if (form.remarks.trim()) fd.append('brokerageRemarks', form.remarks);
    const result = await dispatch(updateAgreementBrokerage(agreementId, fd));
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

  const calc = calcAmount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'UPDATE' ? 'Edit Brokerage Details' : 'Brokerage Details'}
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Brokerage Type <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="flex gap-4">
                {['PERCENTAGE', 'AMOUNT'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.brokerageType === t} onChange={() => set('brokerageType', t)} />
                    <span className="text-sm" style={{ color: 'var(--text-main)' }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Value */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                {form.brokerageType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'} <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="number" value={form.brokerageValue} onChange={e => set('brokerageValue', e.target.value)}
                min="0" max={form.brokerageType === 'PERCENTAGE' ? 100 : undefined} step="0.01" {...inp('brokerageValue')} />
              {calc && (
                <p className="text-xs mt-1" style={{ color: 'var(--brand-primary)' }}>
                  = ₹{calc} {form.brokerageType === 'PERCENTAGE' ? `(${form.brokerageValue}% of ₹${Number(monthlyRent).toLocaleString('en-IN')})` : ''}
                </p>
              )}
              {errors.brokerageValue && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.brokerageValue}</p>}
            </div>
            {/* Is Paid toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Is Brokerage Paid?</p>
              <button type="button" onClick={() => set('isPaid', !form.isPaid)}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: form.isPaid ? 'var(--brand-primary)' : 'var(--surface-border)' }}>
                <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{ transform: form.isPaid ? 'translateX(-2px)' : 'translateX(-20px)' }} />
              </button>
            </div>
            {form.isPaid && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Paid On <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="date" value={form.paidOn} onChange={e => set('paidOn', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                      style={{ borderColor: errors.paidOn ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                    {errors.paidOn && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.paidOn}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Payment Mode <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div className="flex gap-3 pt-1">
                      {['CASH', 'CHEQUE'].map(m => (
                        <label key={m} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={form.paymentMode === m} onChange={() => set('paymentMode', m)} />
                          <span className="text-sm" style={{ color: 'var(--text-main)' }}>{m}</span>
                        </label>
                      ))}
                    </div>
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

export default BrokerageModal;