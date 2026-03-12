import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className='flex items-center justify-between gap-3'>
      <p className='text-sm text-slate-600'>Page {page} of {totalPages}</p>
      <div className='flex items-center gap-1'>
        <Button variant='secondary' size='sm' disabled={page === 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        {pages.map((pageNo) => (
          <button
            key={pageNo}
            onClick={() => onPageChange(pageNo)}
            className={`h-8 min-w-8 rounded px-2 text-sm ${pageNo === page ? 'bg-[#1a365d] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}
          >
            {pageNo}
          </button>
        ))}
        <Button variant='secondary' size='sm' disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  )
}
