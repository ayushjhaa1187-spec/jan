import { Fragment } from 'react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className='mt-4 flex items-center justify-between'>
      <p className='text-sm text-slate-600'>Page {page} of {totalPages}</p>
      <div className='flex items-center gap-2'>
        <Button variant='secondary' size='sm' disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        {pages.map((p, idx) => (
          <Fragment key={p}>
            {idx > 0 && pages[idx - 1] !== p - 1 ? <span className='px-1 text-slate-400'>...</span> : null}
            <button
              type='button'
              className={`h-8 min-w-8 rounded px-2 text-sm ${p === page ? 'bg-[#1a365d] text-white' : 'bg-white border border-slate-300'}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          </Fragment>
        ))}
        <Button variant='secondary' size='sm' disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
