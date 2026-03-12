import { Button } from './Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {[...Array(Math.min(5, totalPages))].map((_, i) => {
          const p = i + 1
          return (
            <Button key={p} size="sm" variant={p === page ? 'primary' : 'ghost'} onClick={() => onPageChange(p)}>
              {p}
            </Button>
          )
        })}
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
