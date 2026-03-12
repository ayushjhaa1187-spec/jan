import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ columns, data, loading = false, emptyMessage = 'No records found.' }: TableProps<T>) {
  return (
    <div className='overflow-x-auto rounded-lg border bg-white'>
      <table className='min-w-full text-left text-sm'>
        <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
          <tr>{columns.map((column) => <th key={column.key} className='px-4 py-3'>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className='border-t'>
                  <td className='px-4 py-3' colSpan={columns.length}><div className='h-4 w-full animate-pulse rounded bg-slate-100' /></td>
                </tr>
              ))
            : null}

          {!loading && data.length === 0 ? (
            <tr><td className='px-4 py-6 text-center text-slate-500' colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : null}

          {!loading
            ? data.map((row, idx) => (
                <tr key={idx} className={`border-t ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-blue-50/40`}>
                  {columns.map((column) => (
                    <td key={column.key} className='px-4 py-3'>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
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
