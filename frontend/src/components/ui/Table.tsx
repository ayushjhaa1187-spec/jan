import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (row: T) => string
}

export function Table<T>({ columns, data, loading, emptyMessage = 'No data found', keyExtractor }: TableProps<T>) {
  if (loading) return <div className="space-y-2">{[1,2,3,4,5].map((i) => <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />)}</div>
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full">
        <thead className="bg-[#1a365d] text-white"><tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 text-left text-xs uppercase tracking-wider">{c.label}</th>)}</tr></thead>
        <tbody>
          {data.length === 0 ? <tr><td className="px-4 py-8 text-center text-gray-400" colSpan={columns.length}>{emptyMessage}</td></tr> : data.map((row, idx) => (
            <tr key={keyExtractor(row)} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((c) => <td key={c.key} className="px-4 py-3 text-sm text-gray-700">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
