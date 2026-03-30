import { useState } from 'react';
import { IconCalendar } from '@tabler/icons-react';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange,
  presets = true,
  maxDate,
  minDate,
  format = 'YYYY-MM-DD',
  variant = 'inline'
}) => {
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');

  const presetRanges = [
    { label: 'Today', getValue: () => ({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] }) },
    { label: 'Yesterday', getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];
      return { start: date, end: date };
    }},
    { label: 'Last 7 Days', getValue: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end };
    }},
    { label: 'Last 30 Days', getValue: () => {
      const end = new Date().toISOString().split('T')[0];
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date().toISOString().split('T')[0];
      return { start, end };
    }},
    { label: 'Last Month', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      return { start, end };
    }}
  ];

  const handlePresetClick = (preset) => {
    const { start, end } = preset.getValue();
    setLocalStart(start);
    setLocalEnd(end);
    onChange({ startDate: start, endDate: end });
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    setLocalStart(value);
    if (localEnd && value <= localEnd) {
      onChange({ startDate: value, endDate: localEnd });
    }
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    setLocalEnd(value);
    if (localStart && value >= localStart) {
      onChange({ startDate: localStart, endDate: value });
    }
  };

  return (
    <div className="space-y-4">
      {presets && (
        <div className="flex flex-wrap gap-2">
          {presetRanges.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <div className="relative">
            <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={localStart}
              onChange={handleStartChange}
              max={maxDate}
              min={minDate}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <div className="relative">
            <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={localEnd}
              onChange={handleEndChange}
              max={maxDate}
              min={localStart || minDate}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {localStart && localEnd && localStart > localEnd && (
        <p className="text-sm text-red-600">End date must be after start date</p>
      )}
    </div>
  );
};

export default DateRangePicker;