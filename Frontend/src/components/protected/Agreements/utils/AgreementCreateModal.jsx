import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { createAgreement } from '../../../../services/repository/AgreementRepo.js';
import { getPropertySummary } from '../../../../services/repository/PropertyRepo.js';
import { getTenantSummary } from '../../../../services/repository/TenantRepo.js';
import { getBrokerSummary } from '../../../../services/repository/BrokerRepo.js';

const DURATION_MONTHS = [11, 22, 33, 55, 110];

const addMonths = (dateStr, months) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const cycleCount = (months) => months / 11;

const AgreementCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch  = useDispatch();
  const pdfRef    = useRef(null);
  const dChequeRef = useRef(null);
  const bChequeRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [tenants,    setTenants]    = useState([]);
  const [brokers,    setBrokers]    = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  const [showDeposit,  setShowDeposit]  = useState(false);
  const [showBroker,   setShowBroker]   = useState(false);

  const [form, setForm] = useState({
    propertyId: '', tenantId: '', durationMonths: '', startDate: '',
    monthlyRent: '', rentEscalationPercent: '', rentDueDay: '', depositAmount: '',
    depositReceivedOn: '', depositPaymentMode: 'CASH',
    depositChequeNumber: '', depositChequeDate: '', depositBankName: '', depositRemarks: '',
    brokerId: '', brokerageType: 'PERCENTAGE', brokerageValue: '', brokerageIsPaid: false,
    brokeragePaidOn: '', brokeragePaymentMode: 'CASH',
    brokerageChequeNumber: '', brokerageChequeDate: '', brokerageBankName: '', brokerageRemarks: '',
  });
  const [pdfFile,      setPdfFile]      = useState(null);
  const [dChequePhoto, setDChequePhoto] = useState(null);
  const [bChequePhoto, setBChequePhoto] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ propertyId: '', tenantId: '', durationMonths: '', startDate: '', monthlyRent: '', rentEscalationPercent: '', rentDueDay: '', depositAmount: '', depositReceivedOn: '', depositPaymentMode: 'CASH', depositChequeNumber: '', depositChequeDate: '', depositBankName: '', depositRemarks: '', brokerId: '', brokerageType: 'PERCENTAGE', brokerageValue: '', brokerageIsPaid: false, brokeragePaidOn: '', brokeragePaymentMode: 'CASH', brokerageChequeNumber: '', brokerageChequeDate: '', brokerageBankName: '', brokerageRemarks: '' });
    setPdfFile(null); setDChequePhoto(null); setBChequePhoto(null);
    setErrors({}); setShowDeposit(false); setShowBroker(false);
    dispatch(getPropertySummary()).then(r => { if (r) setProperties(Array.isArray(r) ? r.filter(p => p.status === 'VACANT' && (p.is_active ?? p.isActive)) : []); });
    dispatch(getTenantSummary()).then(r => { if (r) setTenants(Array.isArray(r) ? r : []); });
    dispatch(getBrokerSummary()).then(r => { if (r) setBrokers(Array.isArray(r) ? r : []); });
  }, [isOpen]);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.propertyId)    e.propertyId    = 'Select a property.';
    if (!form.tenantId)      e.tenantId      = 'Select a tenant.';
    if (!form.durationMonths) e.durationMonths = 'Select duration.';
    if (!form.startDate)     e.startDate     = 'Start date required.';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) e.monthlyRent = 'Enter valid rent.';
    if (!form.rentDueDay || Number(form.rentDueDay) < 1 || Number(form.rentDueDay) > 28) e.rentDueDay = '1–28 only.';
    if (!form.depositAmount || Number(form.depositAmount) <= 0) e.depositAmount = 'Enter valid deposit.';
    if (showDeposit && form.depositReceivedOn) {
      if (form.depositPaymentMode === 'CHEQUE') {
        if (!form.depositChequeNumber.trim()) e.depositChequeNumber = 'Required.';
        if (!form.depositChequeDate) e.depositChequeDate = 'Required.';
        if (!form.depositBankName.trim()) e.depositBankName = 'Required.';
      }
    }
    if (showBroker) {
      if (!form.brokerId) e.brokerId = 'Select a broker.';
      if (!form.brokerageValue || Number(form.brokerageValue) <= 0) e.brokerageValue = 'Enter valid value.';
      if (form.brokerageType === 'PERCENTAGE' && Number(form.brokerageValue) > 100) e.brokerageValue = 'Max 100%.';
    }
    return e;
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('propertyId',    form.propertyId);
    fd.append('tenantId',      form.tenantId);
    fd.append('durationMonths', form.durationMonths);
    fd.append('startDate',     form.startDate);
    fd.append('monthlyRent',   form.monthlyRent);
    fd.append('rentDueDay',    form.rentDueDay);
    fd.append('depositAmount', form.depositAmount);
    if (form.rentEscalationPercent) fd.append('rentEscalationPercent', form.rentEscalationPercent);
    if (pdfFile) fd.append('agreementPdf', pdfFile);
    if (showDeposit && form.depositReceivedOn) {
      fd.append('depositReceivedOn',  form.depositReceivedOn);
      fd.append('depositPaymentMode', form.depositPaymentMode);
      if (form.depositPaymentMode === 'CHEQUE') {
        fd.append('depositChequeNumber', form.depositChequeNumber);
        fd.append('depositChequeDate',   form.depositChequeDate);
        fd.append('depositBankName',     form.depositBankName);
        if (dChequePhoto) fd.append('depositChequePhoto', dChequePhoto);
      }
      if (form.depositRemarks.trim()) fd.append('depositRemarks', form.depositRemarks);
    }
    if (showBroker && form.brokerId) {
      fd.append('brokerId',       form.brokerId);
      fd.append('brokerageType',  form.brokerageType);
      fd.append('brokerageValue', form.brokerageValue);
      fd.append('brokerageIsPaid', form.brokerageIsPaid);
      if (form.brokerageIsPaid) {
        if (form.brokeragePaidOn) fd.append('brokeragePaidOn', form.brokeragePaidOn);
        fd.append('brokeragePaymentMode', form.brokeragePaymentMode);
        if (form.brokeragePaymentMode === 'CHEQUE') {
          fd.append('brokerageChequeNumber', form.brokerageChequeNumber);
          fd.append('brokerageChequeDate',   form.brokerageChequeDate);
          fd.append('brokerageBankName',     form.brokerageBankName);
          if (bChequePhoto) fd.append('brokerageChequePhoto', bChequePhoto);
        }
      }
      if (form.brokerageRemarks.trim()) fd.append('brokerageRemarks', form.brokerageRemarks);
    }
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const result = await dispatch(createAgreement(buildFormData()));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  const dur   = Number(form.durationMonths);
  const cycles = dur ? cycleCount(dur) : 0;
  const rentNum = Number(form.monthlyRent);
  const escPct  = Number(form.rentEscalationPercent);
  const inp = (f) => ({
    className: 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none',
    style: { borderColor: errors[f] ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' },
    onFocus: ev => !errors[f] && (ev.target.style.borderColor = 'var(--brand-primary)'),
    onBlur: ev => !errors[f] && (ev.target.style.borderColor = 'var(--surface-border)'),
  });

  const SectionToggle = ({ label, open, onToggle }) => (
    <button type="button" onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-colors"
      style={{ borderColor: open ? 'var(--brand-primary)' : 'var(--surface-border)', color: open ? 'var(--brand-primary)' : 'var(--text-muted)', backgroundColor: open ? 'rgba(26,107,60,0.05)' : 'var(--surface-bg)' }}>
      {label}
      {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>New Agreement</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* ── SECTION 1: Core ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Agreement Details</p>
              <div className="space-y-4">
                {/* Property */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Property (Vacant only) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select value={form.propertyId} onChange={e => set('propertyId', e.target.value)} {...inp('propertyId')}>
                    <option value="">Select property</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name} — {p.address}</option>)}
                  </select>
                  {errors.propertyId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.propertyId}</p>}
                </div>
                {/* Tenant */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Tenant <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select value={form.tenantId} onChange={e => set('tenantId', e.target.value)} {...inp('tenantId')}>
                    <option value="">Select tenant</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.fullName || t.full_name} — {t.email}</option>)}
                  </select>
                  {errors.tenantId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.tenantId}</p>}
                </div>
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Duration (Months) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_MONTHS.map(d => (
                      <button key={d} type="button" onClick={() => set('durationMonths', String(d))}
                        className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                        style={{
                          borderColor: form.durationMonths === String(d) ? 'var(--brand-primary)' : 'var(--surface-border)',
                          backgroundColor: form.durationMonths === String(d) ? 'rgba(26,107,60,0.1)' : 'var(--surface-bg)',
                          color: form.durationMonths === String(d) ? 'var(--brand-primary)' : 'var(--text-muted)',
                        }}>
                        {d} months
                      </button>
                    ))}
                  </div>
                  {form.durationMonths && form.startDate && (
                    <p className="text-xs mt-2" style={{ color: 'var(--brand-primary)' }}>
                      Agreement ends: {addMonths(form.startDate, dur)}
                    </p>
                  )}
                  {errors.durationMonths && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.durationMonths}</p>}
                </div>
                {/* Start Date + Rent Due Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Start Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                      style={{ borderColor: errors.startDate ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                    {errors.startDate && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Rent Due Day <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="number" value={form.rentDueDay} onChange={e => set('rentDueDay', e.target.value)} min="1" max="28" placeholder="e.g. 5" {...inp('rentDueDay')} />
                    {form.rentDueDay && !errors.rentDueDay && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Rent due on day {form.rentDueDay} of every month</p>
                    )}
                    {errors.rentDueDay && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.rentDueDay}</p>}
                  </div>
                </div>
                {/* Monthly Rent + Deposit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Monthly Rent (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="number" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} min="0" placeholder="e.g. 15000" {...inp('monthlyRent')} />
                    {errors.monthlyRent && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.monthlyRent}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Deposit Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="number" value={form.depositAmount} onChange={e => set('depositAmount', e.target.value)} min="0" placeholder="e.g. 30000" {...inp('depositAmount')} />
                    {errors.depositAmount && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.depositAmount}</p>}
                  </div>
                </div>
                {/* Escalation — only if duration > 11 */}
                {dur > 11 && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Rent Escalation (%)</label>
                    <input type="number" value={form.rentEscalationPercent} onChange={e => set('rentEscalationPercent', e.target.value)} min="0" max="100" step="0.01" placeholder="e.g. 10" {...inp('rentEscalationPercent')} />
                    {rentNum > 0 && escPct > 0 && cycles > 1 && (
                      <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-bg)', border: '1px solid var(--surface-border)' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Escalation Preview:</p>
                        {Array.from({ length: cycles }, (_, i) => {
                          const r = rentNum * Math.pow(1 + escPct / 100, i);
                          return <p key={i} className="text-xs" style={{ color: 'var(--text-main)' }}>Cycle {i + 1}: ₹{Math.round(r).toLocaleString('en-IN')}</p>;
                        })}
                      </div>
                    )}
                  </div>
                )}
                {/* PDF */}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Agreement PDF (optional)</label>
                  <input ref={pdfRef} type="file" accept="application/pdf" onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 10*1024*1024) setPdfFile(f); }} className="hidden" />
                  <button type="button" onClick={() => pdfRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
                    style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <IconUpload size={15} /> {pdfFile ? pdfFile.name : 'Upload PDF (max 10MB)'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Deposit ── */}
            <SectionToggle label="Record Deposit Payment Now? (optional)" open={showDeposit} onToggle={() => setShowDeposit(v => !v)} />
            {showDeposit && (
              <div className="space-y-4 pl-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Received On</label>
                    <input type="date" value={form.depositReceivedOn} onChange={e => set('depositReceivedOn', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                      style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Payment Mode</label>
                    <div className="flex gap-3 pt-1 flex-wrap">
                      {['CASH', 'CHEQUE', 'UPI'].map(m => (
                        <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                          <input type="radio" checked={form.depositPaymentMode === m} onChange={() => set('depositPaymentMode', m)} />
                          <span className="text-sm" style={{ color: 'var(--text-main)' }}>{m}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {form.depositPaymentMode === 'CHEQUE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque No <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="text" value={form.depositChequeNumber} onChange={e => set('depositChequeNumber', e.target.value)} {...inp('depositChequeNumber')} />
                      {errors.depositChequeNumber && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.depositChequeNumber}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Date <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="date" value={form.depositChequeDate} onChange={e => set('depositChequeDate', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                        style={{ borderColor: errors.depositChequeDate ? 'var(--danger)' : 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                      {errors.depositChequeDate && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.depositChequeDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Bank Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <input type="text" value={form.depositBankName} onChange={e => set('depositBankName', e.target.value)} {...inp('depositBankName')} />
                      {errors.depositBankName && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.depositBankName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Photo</label>
                      <input ref={dChequeRef} type="file" accept="image/jpeg,image/png" onChange={e => setDChequePhoto(e.target.files?.[0] || null)} className="hidden" />
                      <button type="button" onClick={() => dChequeRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                        <IconUpload size={14} /> {dChequePhoto ? dChequePhoto.name : 'Upload'}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Remarks</label>
                  <textarea value={form.depositRemarks} onChange={e => set('depositRemarks', e.target.value)} rows={2} maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                </div>
              </div>
            )}

            {/* ── SECTION 3: Broker ── */}
            <SectionToggle label="Was a Broker Involved? (optional)" open={showBroker} onToggle={() => setShowBroker(v => !v)} />
            {showBroker && (
              <div className="space-y-4 pl-1">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Broker <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select value={form.brokerId} onChange={e => set('brokerId', e.target.value)} {...inp('brokerId')}>
                    <option value="">Select broker</option>
                    {brokers.map(b => <option key={b.id} value={b.id}>{b.name} — +91 {b.contact_no}</option>)}
                  </select>
                  {errors.brokerId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.brokerId}</p>}
                </div>
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
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                    {form.brokerageType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'} <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input type="number" value={form.brokerageValue} onChange={e => set('brokerageValue', e.target.value)} min="0" step="0.01" {...inp('brokerageValue')} />
                  {form.brokerageType === 'PERCENTAGE' && form.brokerageValue && rentNum > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--brand-primary)' }}>
                      = ₹{((Number(form.brokerageValue) / 100) * rentNum).toLocaleString('en-IN')} ({form.brokerageValue}% of ₹{rentNum.toLocaleString('en-IN')})
                    </p>
                  )}
                  {errors.brokerageValue && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.brokerageValue}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Is Brokerage Paid?</p>
                  <button type="button" onClick={() => set('brokerageIsPaid', !form.brokerageIsPaid)}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ backgroundColor: form.brokerageIsPaid ? 'var(--brand-primary)' : 'var(--surface-border)' }}>
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: form.brokerageIsPaid ? 'translateX(22px)' : 'translateX(2px)' }} />
                  </button>
                </div>
                {form.brokerageIsPaid && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Paid On</label>
                      <input type="date" value={form.brokeragePaidOn} onChange={e => set('brokeragePaidOn', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                        style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Payment Mode</label>
                      <div className="flex gap-3 pt-1">
                        {['CASH', 'CHEQUE'].map(m => (
                          <label key={m} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" checked={form.brokeragePaymentMode === m} onChange={() => set('brokeragePaymentMode', m)} />
                            <span className="text-sm" style={{ color: 'var(--text-main)' }}>{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {form.brokeragePaymentMode === 'CHEQUE' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque No</label>
                          <input type="text" value={form.brokerageChequeNumber} onChange={e => set('brokerageChequeNumber', e.target.value)} {...inp('brokerageChequeNumber')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Date</label>
                          <input type="date" value={form.brokerageChequeDate} onChange={e => set('brokerageChequeDate', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                            style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Bank Name</label>
                          <input type="text" value={form.brokerageBankName} onChange={e => set('brokerageBankName', e.target.value)} {...inp('brokerageBankName')} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Cheque Photo</label>
                          <input ref={bChequeRef} type="file" accept="image/jpeg,image/png" onChange={e => setBChequePhoto(e.target.files?.[0] || null)} className="hidden" />
                          <button type="button" onClick={() => bChequeRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                            <IconUpload size={14} /> {bChequePhoto ? bChequePhoto.name : 'Upload'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>Brokerage Remarks</label>
                  <textarea value={form.brokerageRemarks} onChange={e => set('brokerageRemarks', e.target.value)} rows={2} maxLength={500}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                    style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)' }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0"
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
              {submitting ? 'Creating...' : 'Create Agreement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgreementCreateModal;