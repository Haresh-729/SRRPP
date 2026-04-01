import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload } from '@tabler/icons-react';
import { recordPayment } from '../../../../services/repository/PaymentRepo.js';

const fmt      = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n)   => n   != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';
const fmtMonth = (s)   => { if (!s) return '—'; const [y, m] = s.split('-'); return new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };
const today    = new Date().toISOString().split('T')[0];

const RecordPaymentModal = ({ isOpen, ledger, onClose, onSuccess }) => {
  const dispatch  = useDispatch();
  const photoRef  = useRef(null);
  const [form, setForm]             = useState({ amount: '', paymentMode: 'CASH', receivedOn: '', chequeNumber: '', chequeDate: '', bankName: '', upiTransactionId: '', remarks: '' });
  const [photo, setPhoto]           = useState(null);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ amount: '', paymentMode: 'CASH', receivedOn: '', chequeNumber: '', chequeDate: '', bankName: '', upiTransactionId: '', remarks: '' });
    setPhoto(null); setErrors({});
  }, [isOpen]);

  const outstanding = ledger ? Number(ledger.balance_carried ?? ledger.total_due) : 0;
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter valid amount.';
    else if (Number(form.amount) > outstanding) e.amount = `Amount exceeds outstanding balance of ${fmtMoney(outstanding)}.`;
    if (!form.receivedOn) e.receivedOn = 'Received date is required.';
    else if (form.receivedOn > today) e.receivedOn = 'Cannot be a future date.';
    if (form.paymentMode === 'CHEQUE') {
      if (!form.chequeNumber.trim()) e.chequeNumber = 'Required for cheque.';
      if (!form.chequeDate) e.chequeDate = 'Required for cheque.';
      if (!form.bankName.trim()) e.bankName = 'Required for cheque.';
    }
    if (form.paymentMode === 'UPI' && !form.upiTransactionId.trim()) e.upiTransactionId = 'Required for UPI.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('amount',      form.amount);
    fd.append('paymentMode', form.paymentMode);
    fd.append('receivedOn',  form.receivedOn);
    if (form.paymentMode === 'CHEQUE') {
      fd.append('chequeNumber', form.chequeNumber);
      fd.append('chequeDate',   form.chequeDate);
      fd.append('bankName',     form.bankName);
      if (photo) fd.append('chequePhoto', photo);
    }
    if (form.paymentMode === 'UPI') fd.append('upiTransactionId', form.upiTransactionId);
    if (form.remarks.trim()) fd.append('remarks', form.remarks);
    const result = await dispatch(recordPayment(ledger.id, fd));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen || !ledger) return null;

  const inp = (f) => ({
    className: 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none',
    style: { borderColor: errors[f] ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' },
    onFocus: ev => !errors[f] && (ev.target.style.borderColor = 'var(--brand-primary)'),
    onBlur:  ev => !errors[f] && (ev.target.style.borderColor = 'var(--surface-border)'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>

        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Record Payment</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        {/* Context bar */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span style={{ color: 'var(--text-muted)' }}>Property: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ledger.properties?.name || '—'}</span></span>
            <span style={{ color: 'var(--text-muted)' }}>Tenant: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{ledger.tenants?.full_name || '—'}</span></span>
            <span style={{ color: 'var(--text-muted)' }}>Month: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{fmtMonth(ledger.ledger_month)}</span></span>
            <span style={{ color: 'var(--text-muted)' }}>Total Due: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{fmtMoney(ledger.total_due)}</span></span>
            <span style={{ color: 'var(--text-muted)' }}>Paid: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{fmtMoney(ledger.paid_amount)}</span></span>
            <span style={{ color: 'var(--text-muted)' }}>Outstanding: <span style={{ color: outstanding > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{fmtMoney(outstanding)}</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} min="0.01" step="0.01" placeholder={`Max: ${fmtMoney(outstanding)}`} {...inp('amount')} />
              {errors.amount && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.amount}</p>}
              {!errors.amount && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Outstanding balance: {fmtMoney(outstanding)}</p>}
            </div>
            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Payment Mode <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div className="flex gap-4">
                {['CASH', 'CHEQUE', 'UPI'].map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.paymentMode === m} onChange={() => set('paymentMode', m)} />
                    <span className="text-sm" style={{ color: 'var(--text-main)' }}>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Received On */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Received On <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="date" value={form.receivedOn} max={today} onChange={e => set('receivedOn', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                style={{ borderColor: errors.receivedOn ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
              {errors.receivedOn && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.receivedOn}</p>}
            </div>
            {/* CHEQUE fields */}
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
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png" onChange={e => setPhoto(e.target.files?.[0] || null)} className="hidden" />
                  <button type="button" onClick={() => photoRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <IconUpload size={14} /> {photo ? photo.name : 'Upload Photo (JPG/PNG, max 5MB)'}
                  </button>
                </div>
              </>
            )}
            {/* UPI field */}
            {form.paymentMode === 'UPI' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>UPI Transaction ID <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input type="text" value={form.upiTransactionId} onChange={e => set('upiTransactionId', e.target.value)} placeholder="e.g. TXN202502051234" {...inp('upiTransactionId')} />
                {errors.upiTransactionId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.upiTransactionId}</p>}
              </div>
            )}
            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Remarks</label>
              <textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} maxLength={500}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;