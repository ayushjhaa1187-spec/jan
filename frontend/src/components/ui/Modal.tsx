'use client'

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

export function Modal({ open, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onEsc)
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50'>
      <div className='absolute inset-0 bg-black/50 transition-opacity' onClick={onClose} />
      <div className='absolute inset-0 grid place-items-center p-4'>
        <div className={cn('w-full rounded-lg bg-white shadow-xl transition-all duration-200 scale-100 opacity-100', maxWidthClass[maxWidth])}>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h3 className='text-lg font-semibold'>{title}</h3>
            <button onClick={onClose} className='rounded p-1 hover:bg-slate-100' aria-label='Close'>
              <X size={18} />
            </button>
          </div>
          <div className='max-h-[70vh] overflow-y-auto p-4'>{children}</div>
          {footer ? <div className='flex justify-end gap-2 border-t px-4 py-3'>{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}
