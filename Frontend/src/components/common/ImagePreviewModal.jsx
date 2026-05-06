import { IconX } from '@tabler/icons-react';
import { resolveMediaUrl } from '../../services/utils/media.js';

const ImagePreviewModal = ({ isOpen, src, title = 'Image Preview', onClose }) => {
  if (!isOpen || !src) return null;

  const resolvedSrc = resolveMediaUrl(src);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto p-4 flex items-center justify-center" style={{ backgroundColor: 'var(--surface-bg)' }}>
          <img
            src={resolvedSrc}
            alt={title}
            className="max-w-full h-auto rounded-xl shadow-lg"
            style={{ maxHeight: '75vh' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
