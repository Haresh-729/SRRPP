import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2, IconUpload, IconFileText } from '@tabler/icons-react';
import { apiConnector } from '../../../../services/Connector.js';
import { agreementEndpoints } from '../../../../services/Apis.js';

const MAX_MB = 10;

const UpdatePdfModal = ({ isOpen, agreementId, existingPdf, onClose, onSuccess }) => {
  const dispatch    = useDispatch();
  const fileRef     = useRef(null);
  const [file, setFile]           = useState(null);
  const [error, setError]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!isOpen) { setFile(null); setError(''); } }, [isOpen]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Only PDF files allowed.'); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`Max ${MAX_MB}MB.`); return; }
    setFile(f); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('agreementPdf', file);
      const url = agreementEndpoints.UPDATE_PDF.url.replace('{id}', agreementId);
      const res = await apiConnector(agreementEndpoints.UPDATE_PDF.type, url, fd);
      if (res.data.success) { onSuccess(); onClose(); }
      else throw new Error(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>Update Agreement PDF</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-5 space-y-4">
            {existingPdf && (
              <div className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-bg)' }}>
                <IconFileText size={16} style={{ color: 'var(--brand-primary)' }} />
                <a href={existingPdf} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium hover:underline flex-1 truncate"
                  style={{ color: 'var(--brand-primary)' }}>Current PDF — View</a>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(232,160,32,0.12)', color: 'var(--warning)' }}>Replace</span>
              </div>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors"
              style={{ borderColor: error ? 'var(--danger)' : 'var(--surface-border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--surface-border)')}>
              <IconUpload size={16} />
              {file ? file.name : 'Click to upload PDF'}
            </button>
            {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PDF only, max {MAX_MB}MB</p>
          </div>
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t"
            style={{ borderColor: 'var(--surface-border)' }}>
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-50"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>Cancel</button>
            <button type="submit" disabled={submitting || !file}
              className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}>
              {submitting && <IconLoader2 size={14} className="animate-spin" />}
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePdfModal;