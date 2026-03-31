import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconX, IconLoader2 } from '@tabler/icons-react';
import { createPropertyType, updatePropertyType } from '../../../../services/repository/PropertyTypeRepo.js';

// mode: 'CREATE' | 'EDIT'
const PropertyTypeFormModal = ({ isOpen, mode, selected, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'EDIT' && selected) {
      setForm({
        name: selected.name || '',
        description: selected.description || '',
        isActive: selected.is_active ?? true,
      });
    } else {
      setForm({ name: '', description: '', isActive: true });
    }
    setErrors({});
    setIsDirty(false);
  }, [isOpen, mode, selected]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    else if (form.name.trim().length > 100) e.name = 'Name must be under 100 characters.';
    if (form.description && form.description.length > 500) e.description = 'Description must be under 500 characters.';
    return e;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Close anyway?')) return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e_ = validate();
    if (Object.keys(e_).length) { setErrors(e_); return; }

    setSubmitting(true);
    let result;
    if (mode === 'CREATE') {
      result = await dispatch(createPropertyType(form.name.trim(), form.description.trim() || undefined));
    } else {
      result = await dispatch(
        updatePropertyType(selected.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.isActive,
        })
      );
    }
    setSubmitting(false);
    if (result) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  const title = mode === 'CREATE' ? 'Add Property Type' : 'Edit Property Type';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div
          className="relative w-full max-w-md rounded-2xl shadow-2xl"
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--surface-border)' }}
          >
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Name <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Residential, Shop, Office"
                  maxLength={100}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{
                    borderColor: errors.name ? 'var(--danger)' : 'var(--surface-border)',
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => !errors.name && (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => !errors.name && (e.target.style.borderColor = 'var(--surface-border)')}
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description of this property type"
                  maxLength={500}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors resize-none"
                  style={{
                    borderColor: errors.description ? 'var(--danger)' : 'var(--surface-border)',
                    backgroundColor: 'var(--surface-bg)',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => !errors.description && (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => !errors.description && (e.target.style.borderColor = 'var(--surface-border)')}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-xs" style={{ color: 'var(--danger)' }}>{errors.description}</p>
                    : <span />
                  }
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {form.description.length}/500
                  </p>
                </div>
              </div>

              {/* Is Active — EDIT only */}
              {mode === 'EDIT' && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-main)' }}>Active</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Inactive types won't appear in property creation
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('isActive', !form.isActive)}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{ backgroundColor: form.isActive ? 'var(--brand-primary)' : 'var(--surface-border)' }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: form.isActive ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-end gap-3 px-6 py-4 border-t"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-main)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-inverse)' }}
              >
                {submitting && <IconLoader2 size={14} className="animate-spin" />}
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeFormModal;