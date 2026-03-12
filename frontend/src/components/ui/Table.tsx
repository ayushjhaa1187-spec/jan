import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, loading = false, emptyMessage = 'No data found' }: TableProps<T>) {
  return (
    <div className='w-full overflow-x-auto rounded-lg border bg-white'>
      <table className='w-full text-sm'>
        <thead className='bg-slate-50'>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className='px-4 py-3 text-left font-semibold text-slate-700'>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className='border-t'>
                  {columns.map((col) => (
                    <td key={`${col.key}-${index}`} className='px-4 py-3'>
                      <div className='h-4 w-full bg-slate-100 animate-pulse rounded' />
                    </td>
                  ))}
                </tr>
              ))
            : data.length > 0
              ? data.map((row, rowIndex) => (
                  <tr key={rowIndex} className={`border-t hover:bg-slate-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                    {columns.map((col) => (
                      <td key={`${col.key}-${rowIndex}`} className='px-4 py-3 text-slate-700'>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              : (
                <tr>
                  <td className='px-4 py-8 text-center text-slate-500' colSpan={columns.length}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
        </tbody>
      </table>
    </div>
  );
}
