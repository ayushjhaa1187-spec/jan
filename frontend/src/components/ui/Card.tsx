import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  variant?: 'default' | 'compact'
}

export function Card({ title, description, actions, children, variant = 'default' }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-white shadow-sm', variant === 'compact' ? 'p-3' : 'p-5')}>
      {(title || description || actions) && (
        <div className='mb-4 flex items-start justify-between gap-4'>
          <div>
            {title ? <h3 className='text-base font-semibold text-slate-900'>{title}</h3> : null}
            {description ? <p className='text-sm text-slate-500'>{description}</p> : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
