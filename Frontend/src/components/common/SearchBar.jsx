import { useState, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search...',
  debounceMs = 300,
  showClearButton = true,
  loading = false,
  size = 'md'
}) => {
  const [internalValue, setInternalValue] = useState(value);

  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg'
  };

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs]);

  return (
    <div className="relative w-full">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${sizeClasses[size]}`}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {showClearButton && internalValue && !loading && (
        <button
          onClick={() => setInternalValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <IconX size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;