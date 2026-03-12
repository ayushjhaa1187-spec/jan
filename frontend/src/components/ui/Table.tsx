import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Array<Column<T>>
  data: T[]
  loading?: boolean
  emptyMessage?: string
}

export function Table<T extends Record<string, unknown>>({ columns, data, loading = false, emptyMessage = 'No data found.' }: TableProps<T>) {
  return (
    <div className='overflow-x-auto rounded-lg border bg-white'>
      <table className='min-w-full text-sm'>
        <thead className='bg-slate-50'>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className='px-4 py-3 text-left font-medium text-slate-700'>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`loading-${index}`} className='border-t'>
                  <td colSpan={columns.length} className='px-4 py-3'>
                    <div className='h-4 w-full animate-pulse rounded bg-slate-100' />
                  </td>
                </tr>
              ))
            : data.length === 0
              ? (
                <tr>
                  <td colSpan={columns.length} className='px-4 py-8 text-center text-slate-500'>
                    {emptyMessage}
                  </td>
                </tr>
                )
              : data.map((row, rowIndex) => (
                <tr key={rowIndex} className='border-t odd:bg-white even:bg-slate-50/20 hover:bg-slate-50'>
                  {columns.map((column) => (
                    <td key={String(column.key)} className='px-4 py-3'>
                      {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}
