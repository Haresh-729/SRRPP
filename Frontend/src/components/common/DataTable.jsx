import { useState } from 'react';
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react';

const DataTable = ({ 
  columns, 
  data, 
  sortable = false,
  sortColumn = '',
  sortDirection = 'asc',
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  expandable = false,
  renderExpandedRow,
  emptyMessage = 'No data found',
  loading = false,
  striped = true,
  hover = true
}) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const handleSort = (column) => {
    if (!column.sortable) return;
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort?.(column.key, newDirection);
  };

  const toggleExpand = (rowId) => {
    setExpandedRows(prev => 
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange?.(data.map((_, idx) => idx));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowIdx) => {
    onSelectionChange?.(
      selectedRows.includes(rowIdx) 
        ? selectedRows.filter(id => id !== rowIdx)
        : [...selectedRows, rowIdx]
    );
  };

  if (loading) {
    return (
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
        <div className="animate-pulse space-y-3 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  style={{ width: column.width || 'auto' }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span>
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                        ) : (
                          <IconSelector size={16} className="text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {expandable && <th className="px-6 py-3 w-12"></th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <>
                  <tr
                    key={rowIdx}
                    className={`${striped && rowIdx % 2 === 1 ? 'bg-gray-50' : 'bg-white'} ${hover ? 'hover:bg-gray-100' : ''} transition`}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(rowIdx)}
                          onChange={() => handleSelectRow(rowIdx)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-gray-900 text-${column.align || 'left'}`}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {expandable && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleExpand(rowIdx)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRows.includes(rowIdx) ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                        </button>
                      </td>
                    )}
                  </tr>
                  {expandable && expandedRows.includes(rowIdx) && (
                    <tr>
                      <td colSpan={columns.length + (selectable ? 1 : 0) + 1} className="px-6 py-4 bg-gray-50">
                        {renderExpandedRow?.(row)}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;