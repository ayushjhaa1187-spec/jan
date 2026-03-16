import { ReactNode } from 'react'
import { clsx } from 'clsx'

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
  onSelectChange?: (selectedIds: string[]) => void
  selectedIds?: string[]
}

export function Table<T>({ 
  columns, 
  data, 
  loading, 
  emptyMessage = 'No data found', 
  keyExtractor, 
  onSelectChange,
  selectedIds = []
}: TableProps<T>) {
  const isAllSelected = data.length > 0 && selectedIds.length === data.length

  const handleSelectAll = () => {
    if (onSelectChange) {
      if (isAllSelected) {
        onSelectChange([])
      } else {
        onSelectChange(data.map(keyExtractor))
      }
    }
  }

  const handleSelectRow = (id: string) => {
    if (onSelectChange) {
      if (selectedIds.includes(id)) {
        onSelectChange(selectedIds.filter(i => i !== id))
      } else {
        onSelectChange([...selectedIds, id])
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, index) => (
          <div key={String(index)} className="h-10 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-[#1e293b]">
        <thead className="bg-[#1a365d] text-white">
          <tr>
            {onSelectChange && (
              <th className="px-6 py-4 w-10">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </th>
            )}
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectChange ? 1 : 0)} className="px-6 py-12 text-center text-gray-500 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const id = keyExtractor(row)
              const isSelected = selectedIds.includes(id)
              return (
                <tr 
                  key={id} 
                  className={clsx(
                    "hover:bg-blue-50 transition-colors duration-150",
                    isSelected && "bg-indigo-50/50"
                  )}
                >
                  {onSelectChange && (
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {column.render 
                        ? column.render(row) 
                        : String((row as Record<string, any>)[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
