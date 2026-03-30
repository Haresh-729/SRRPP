import { useState } from 'react';
import { IconFileSpreadsheet, IconFileTypePdf, IconFileTypeCsv, IconDatabase, IconChevronDown, IconDownload } from '@tabler/icons-react';

const ExportMenu = ({ 
  onExport, 
  formats = ['excel', 'pdf', 'csv', 'tally'],
  filename = 'export',
  loading = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatConfig = {
    excel: {
      icon: IconFileSpreadsheet,
      label: 'Export as Excel',
      extension: '.xlsx',
      color: 'text-green-600'
    },
    pdf: {
      icon: IconFileTypePdf,
      label: 'Export as PDF',
      extension: '.pdf',
      color: 'text-red-600'
    },
    csv: {
      icon: IconFileTypeCsv,
      label: 'Export as CSV',
      extension: '.csv',
      color: 'text-blue-600'
    },
    tally: {
      icon: IconDatabase,
      label: 'Export to Tally',
      extension: '.xml',
      color: 'text-orange-600',
      subtitle: 'Tally ERP compatible'
    }
  };

  const handleExport = (format) => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <IconDownload size={18} />
            <span>Export</span>
            <IconChevronDown size={16} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {formats.map((format) => {
              const config = formatConfig[format];
              const Icon = config.icon;
              return (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg"
                >
                  <Icon size={20} className={config.color} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{config.label}</p>
                    {config.subtitle && (
                      <p className="text-xs text-gray-500">{config.subtitle}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportMenu;