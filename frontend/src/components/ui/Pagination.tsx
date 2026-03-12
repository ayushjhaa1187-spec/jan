import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className='flex items-center justify-between gap-3 mt-4'>
      <p className='text-sm text-slate-600'>Page {page} of {totalPages}</p>
      <div className='flex items-center gap-2'>
        <Button variant='secondary' disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        <div className='flex items-center gap-1'>
          {pages.map((item) => (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`h-9 min-w-9 rounded px-2 text-sm ${item === page ? 'bg-[#1a365d] text-white' : 'bg-white border'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <Button variant='secondary' disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
