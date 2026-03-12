import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, page + 2),
  );

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button variant='secondary' size='sm' disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Prev
      </Button>
      {pages.map((item) => (
        <button
          key={item}
          type='button'
          onClick={() => onPageChange(item)}
          className={`h-8 min-w-8 rounded px-2 text-sm ${item === page ? 'bg-primary text-white' : 'border border-slate-300 bg-white text-slate-700'}`}
        >
          {item}
        </button>
      ))}
      <Button variant='secondary' size='sm' disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Next
      </Button>
      <span className='ml-2 text-sm text-slate-600'>
        Page {page} of {Math.max(totalPages, 1)}
      </span>
    </div>
  );
}
