import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Array<Column<T>>;
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, loading = false, emptyMessage = 'No records found.' }: TableProps<T>) {
  return (
    <div className='w-full overflow-x-auto rounded-lg border border-slate-200 bg-white'>
      <table className='min-w-full border-collapse text-left text-sm'>
        <thead>
          <tr className='bg-slate-50'>
            {columns.map((column) => (
              <th key={String(column.key)} className='px-4 py-3 font-semibold text-slate-700'>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className='border-t border-slate-100'>
                  {columns.map((column) => (
                    <td key={`${String(column.key)}-${index}`} className='px-4 py-3'>
                      <div className='h-4 w-24 animate-pulse rounded bg-slate-200' />
                    </td>
                  ))}
                </tr>
              ))
            : null}

          {!loading && data.length === 0 ? (
            <tr>
              <td className='px-4 py-8 text-center text-slate-500' colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}

          {!loading
            ? data.map((row, index) => (
                <tr
                  key={index.toString()}
                  className={cn(
                    'border-t border-slate-100 transition hover:bg-slate-50',
                    index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white',
                  )}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className='px-4 py-3 text-slate-700'>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
