import { Button } from './Button'

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-600">Page {page} of {Math.max(totalPages, 1)}</p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Prev</Button>
        {pages.map((p) => <Button key={String(p)} variant={p === page ? 'primary' : 'secondary'} size="sm" onClick={() => onPageChange(p)}>{p}</Button>)}
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  )
}
