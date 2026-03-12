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

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ open, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 transition-opacity'
      onClick={onClose}
      role='presentation'
    >
      <div
        className={cn('w-full rounded-xl bg-white shadow-2xl transition-transform duration-200 scale-100', maxWidthClass[maxWidth])}
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        aria-modal='true'
      >
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <h3 className='text-base font-semibold text-slate-900'>{title}</h3>
          <button type='button' onClick={onClose} className='rounded p-1 text-slate-500 hover:bg-slate-100'>
            <X size={18} />
          </button>
        </div>
        <div className='px-5 py-4'>{children}</div>
        {footer ? <div className='flex justify-end gap-2 border-t border-slate-200 px-5 py-4'>{footer}</div> : null}
      </div>
    </div>
  );
}
