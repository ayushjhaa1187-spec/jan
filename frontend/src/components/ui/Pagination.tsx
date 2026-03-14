import { Button } from './Button'

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Prev</Button>
        {pages.map((p) => <Button key={p} size="sm" variant={p === page ? 'primary' : 'secondary'} onClick={() => onPageChange(p)}>{p}</Button>)}
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next</Button>
      </div>
    </div>
  )
}
