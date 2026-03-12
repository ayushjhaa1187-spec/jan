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
  maxWidth?: 'sm' | 'md' | 'lg';
}

const widthMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export function Modal({ open, onClose, title, children, footer, maxWidth = 'sm' }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50 transition', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div
        className={cn('absolute inset-0 bg-black/50 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div className='absolute inset-0 grid place-items-center p-4'>
        <div
          className={cn(
            'w-full rounded-lg bg-white shadow-xl transition-all',
            widthMap[maxWidth],
            open ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          )}
        >
          <header className='flex items-center justify-between border-b p-4'>
            <h3 className='font-semibold'>{title}</h3>
            <button type='button' onClick={onClose} className='rounded p-1 hover:bg-slate-100'>
              <X size={18} />
            </button>
          </header>
          <div className='max-h-[70vh] overflow-y-auto p-4'>{children}</div>
          {footer ? <footer className='flex justify-end gap-2 border-t p-4'>{footer}</footer> : null}
        </div>
      </div>
    </div>
  );
}
