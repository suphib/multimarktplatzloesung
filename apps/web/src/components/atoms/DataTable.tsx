import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  onSort?: (field: string) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  isLoading,
  emptyMessage = 'Keine Daten vorhanden',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {columns.map((col, i) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 ${
                  i === 0 ? 'sticky left-0 bg-gray-50 dark:bg-gray-900 z-10' : ''
                } ${col.sortable && onSort ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100' : ''} ${col.className || ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    sortDirection === 'ASC' ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={(row as any).id || rowIdx}
                className={`border-b border-gray-100 dark:border-gray-700 ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      i === 0 ? 'sticky left-0 bg-white dark:bg-gray-800 z-10' : ''
                    } ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
