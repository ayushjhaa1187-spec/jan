'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ open, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50'>
      <button
        type='button'
        className='absolute inset-0 bg-black/40 transition-opacity duration-200'
        onClick={onClose}
        aria-label='Close modal backdrop'
      />
      <div className='absolute inset-0 grid place-items-center p-4'>
        <div
          className={cn(
            'w-full rounded-lg bg-white shadow-xl border border-slate-200 transform transition-all duration-200 scale-100 opacity-100',
            maxWidthMap[maxWidth],
          )}
        >
          <header className='flex items-center justify-between px-4 py-3 border-b'>
            <h3 className='text-lg font-semibold'>{title}</h3>
            <button type='button' onClick={onClose} className='text-slate-500 hover:text-slate-800'>
              <X size={18} />
            </button>
          </header>
          <div className='p-4'>{children}</div>
          {footer ? <footer className='px-4 py-3 border-t flex justify-end gap-2'>{footer}</footer> : null}
        </div>
      </div>
    </div>
  );
}
