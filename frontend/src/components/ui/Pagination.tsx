'use client'

import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">Page {page} of {Math.max(totalPages, 1)}</p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        {pages.map((num) => (
          <Button key={num} size="sm" variant={num === page ? 'primary' : 'ghost'} onClick={() => onPageChange(num)}>{num}</Button>
        ))}
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  )
}
