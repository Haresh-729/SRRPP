import { useState } from 'react';
import { IconAlertTriangle, IconHelp, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import Modal from './Modal';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  icon = 'question',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'blue',
  requireInput = false,
  inputPlaceholder = '',
  typeToConfirm = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const icons = {
    danger: <IconAlertTriangle className="text-red-600" size={32} />,
    warning: <IconAlertCircle className="text-orange-600" size={32} />,
    question: <IconHelp className="text-blue-600" size={32} />,
    info: <IconInfoCircle className="text-blue-600" size={32} />
  };

  const colorClasses = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700'
  };

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(inputValue);
    setLoading(false);
    setInputValue('');
    onClose();
  };

  const isConfirmDisabled = () => {
    if (loading) return true;
    if (typeToConfirm && inputValue !== typeToConfirm) return true;
    if (requireInput && !inputValue.trim()) return true;
    return false;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" closable={!loading}>
      <div className="text-center">
        <div className="mx-auto w-12 h-12 flex items-center justify-center mb-4">
          {icons[icon]}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>

        {(requireInput || typeToConfirm) && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputPlaceholder || (typeToConfirm ? `Type "${typeToConfirm}" to confirm` : 'Enter reason')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
            autoFocus
          />
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled()}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses[confirmColor]}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;