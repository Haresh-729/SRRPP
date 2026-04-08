import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconX, IconLoader2, IconFileText, IconTrash, IconUpload } from '@tabler/icons-react';
import {
  createProperty,
  updateProperty,
  getPropertyById,
  deletePurchaseAgreementPdf,
} from '../../../../services/repository/PropertyRepo.js';
import { listActivePropertyTypes } from '../../../../services/repository/PropertyTypeRepo.js';
import { selectAccount } from '../../../../app/DashboardSlice.js';

const MAX_PDF_MB = 10;
const today = new Date().toISOString().split('T')[0];

const PropertyFormModal = ({ isOpen, mode, propertyId, onClose, onSuccess }) => {
  const dispatch  = useDispatch();
  const fileRef   = useRef(null);

  const [propTypes, setPropTypes]         = useState([]);
  const [property, setProperty]           = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [isDirty, setIsDirty]             = useState(false);
  const [removingPdf, setRemovingPdf]     = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [form, setForm] = useState({
    propertyTypeId: '', name: '', address: '',
    areaSqFt: '', purchaseDate: '', purchaseAmount: '',
    isActive: true,
  });
  const [pdfFile, setPdfFile]   = useState(null);   // new file selected
  const [pdfError, setPdfError] = useState('');
  const [errors, setErrors]     = useState({});

  // fetch active property types once
  useEffect(() => {
    if (!isOpen) return;
    dispatch(listActivePropertyTypes()).then(res => { if (res) setPropTypes(res); });
  }, [isOpen]);

  // fetch property in EDIT
  useEffect(() => {
    if (!isOpen || mode !== 'EDIT' || !propertyId) return;
    dispatch(getPropertyById(propertyId)).then(res => {
      if (!res) return;
      setProperty(res);
      setForm({
        propertyTypeId: res.propertyTypeId || res.property_type_id || '',
        name:           res.name           || '',
        address:        res.address        || '',
        areaSqFt:       res.areaSqFt       != null ? String(res.areaSqFt) : '',
        purchaseDate:   res.purchaseDate   ? res.purchaseDate.split('T')[0] : '',
        purchaseAmount: res.purchaseAmount != null ? String(res.purchaseAmount) : '',
        isActive:       res.isActive       ?? true,
      });
    });
  }, [isOpen, mode, propertyId]);

  // reset on close
  useEffect(() => {
    if (isOpen) return;
    setForm({ propertyTypeId: '', name: '', address: '', areaSqFt: '', purchaseDate: '', purchaseAmount: '', isActive: true });
    setPdfFile(null); setPdfError(''); setErrors({}); setIsDirty(false);
    setProperty(null); setConfirmRemove(false);
  }, [isOpen]);

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setIsDirty(true);
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setPdfError('Only PDF files are allowed.'); return; }
    if (f.size > MAX_PDF_MB * 1024 * 1024) { setPdfError(`PDF must be under ${MAX_PDF_MB}MB.`); return; }
    setPdfFile(f); setPdfError(''); setIsDirty(true);
  };

  const validate = () => {
    const e = {};
    if (!form.propertyTypeId)              e.propertyTypeId  = 'Property type is required.';
    if (!form.name.trim())                 e.name            = 'Name is required.';
    else if (form.name.trim().length < 2)  e.name            = 'Min 2 characters.';
    else if (form.name.trim().length > 255) e.name           = 'Max 255 characters.';
    if (!form.address.trim())              e.address         = 'Address is required.';
    else if (form.address.trim().length < 5) e.address       = 'Min 5 characters.';
    if (!form.areaSqFt || isNaN(form.areaSqFt) || Number(form.areaSqFt) <= 0)
                                           e.areaSqFt        = 'Enter a valid positive area.';
    if (!form.purchaseDate)                e.purchaseDate    = 'Purchase date is required.';
    else if (form.purchaseDate > today)    e.purchaseDate    = 'Purchase date cannot be in the future.';
    if (!form.purchaseAmount || isNaN(form.purchaseAmount) || Number(form.purchaseAmount) <= 0)
                                           e.purchaseAmount  = 'Enter a valid positive amount.';
    return e;
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('propertyTypeId',  form.propertyTypeId);
    fd.append('name',            form.name.trim());
    fd.append('address',         form.address.trim());
    fd.append('areaSqFt',        form.areaSqFt);
    fd.append('purchaseDate',    form.purchaseDate);
    fd.append('purchaseAmount',  form.purchaseAmount);
    if (mode === 'EDIT') fd.append('isActive', form.isActive);
    if (pdfFile) fd.append('purchaseAgreementPdf', pdfFile);
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ev = validate();
    if (Object.keys(ev).length) { setErrors(ev); return; }
    setSubmitting(true);
    const fd = buildFormData();
    const result = mode === 'CREATE'
      ? await dispatch(createProperty(fd))
      : await dispatch(updateProperty(propertyId, fd));
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  const handleRemovePdf = async () => {
    setRemovingPdf(true);
    const ok = await dispatch(deletePurchaseAgreementPdf(propertyId));
    setRemovingPdf(false);
    setConfirmRemove(false);
    if (ok) {
      setProperty(p => ({ ...p, purchaseAgreementPdf: null }));
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('Unsaved changes. Close anyway?')) return;
    onClose();
  };

  if (!isOpen) return null;

  const existingPdf = property?.purchaseAgreementPdf || property?.purchase_agreement_pdf;

  const inputCls = (field) => ({
    borderColor: errors[field] ? 'var(--danger)' : 'var(--surface-border)',
    backgroundColor: 'var(--surface-bg)', color: 'var(--text-main)',
  });
  const focusStyle = (field) => ({
    onFocus: e => !errors[field] && (e.target.style.borderColor = 'var(--brand-primary)'),
    onBlur:  e => !errors[field] && (e.target.style.borderColor = errors[field] ? 'var(--danger)' : 'var(--surface-border)'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
            {mode === 'CREATE' ? 'Add Property' : 'Edit Property'}
          </h3>
          <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Property Type <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select value={form.propertyTypeId} onChange={e => set('propertyTypeId', e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputCls('propertyTypeId')} {...focusStyle('propertyTypeId')}>
                <option value="">Select property type</option>
                {propTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
              {errors.propertyTypeId && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.propertyTypeId}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Property Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Raut Plaza Shop 1" maxLength={255}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputCls('name')} {...focusStyle('name')} />
              {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Address <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Full address with city, state, pincode"
                maxLength={1000} rows={3}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={inputCls('address')} {...focusStyle('address')} />
              {errors.address && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.address}</p>}
            </div>

            {/* Area + Purchase Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Area (sq.ft.) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="number" value={form.areaSqFt} onChange={e => set('areaSqFt', e.target.value)}
                  placeholder="e.g. 450.50" min="0" step="0.01"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={inputCls('areaSqFt')} {...focusStyle('areaSqFt')} />
                {errors.areaSqFt && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.areaSqFt}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Purchase Date <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="date" value={form.purchaseDate} max={today}
                  onChange={e => set('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none date-input"
                  style={inputCls('purchaseDate')} {...focusStyle('purchaseDate')} />
                {errors.purchaseDate && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.purchaseDate}</p>}
              </div>
            </div>

            {/* Purchase Amount */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Purchase Amount (₹) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="number" value={form.purchaseAmount} onChange={e => set('purchaseAmount', e.target.value)}
                placeholder="e.g. 2500000" min="0"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={inputCls('purchaseAmount')} {...focusStyle('purchaseAmount')} />
              {errors.purchaseAmount && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.purchaseAmount}</p>}
            </div>

            {/* Purchase Agreement PDF */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                Purchase Agreement PDF
              </label>

              {/* Existing PDF in EDIT mode */}
              {mode === 'EDIT' && existingPdf && !pdfFile && (
                <div className="flex items-center gap-3 p-3 rounded-lg border mb-2"
                  style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                  <IconFileText size={18} style={{ color: 'var(--brand-primary)' }} />
                  <a href={existingPdf} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium flex-1 truncate hover:underline"
                    style={{ color: 'var(--brand-primary)' }}>
                    View Agreement PDF
                  </a>
                  {!confirmRemove ? (
                    <button type="button" onClick={() => setConfirmRemove(true)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                      style={{ color: 'var(--danger)', backgroundColor: 'rgba(217,48,37,0.08)' }}>
                      <IconTrash size={12} /> Remove
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--danger)' }}>Confirm?</span>
                      <button type="button" onClick={handleRemovePdf} disabled={removingPdf}
                        className="text-xs px-2 py-1 rounded font-medium disabled:opacity-60"
                        style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
                        {removingPdf ? '...' : 'Yes'}
                      </button>
                      <button type="button" onClick={() => setConfirmRemove(false)} className="text-xs px-2 py-1 rounded"
                        style={{ color: 'var(--text-muted)' }}>No</button>
                    </div>
                  )}
                </div>
              )}

              {/* File picker */}
              {(!existingPdf || pdfFile) && (
                <div>
                  <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
                    style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <IconUpload size={15} />
                    {pdfFile ? pdfFile.name : 'Upload PDF'}
                  </button>
                  {mode === 'EDIT' && existingPdf && (
                    <button type="button" onClick={() => setPdfFile(null)} className="ml-2 text-xs"
                      style={{ color: 'var(--text-muted)' }}>Cancel new upload</button>
                  )}
                  {pdfError && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{pdfError}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF only, max {MAX_PDF_MB}MB</p>
                </div>
              )}
            </div>

            {/* Is Active — EDIT only */}
            {mode === 'EDIT' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Active</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inactive properties are hidden from users</p>
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

export default PropertyFormModal;