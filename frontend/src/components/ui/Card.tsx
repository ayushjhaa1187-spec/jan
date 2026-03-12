import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
}

export function Card({
  title,
  description,
  actions,
  children,
  variant = 'default',
  className,
}: CardProps) {
  return (
    <section
      className={cn(
        'bg-white rounded-lg border border-slate-200 shadow-sm',
        variant === 'default' ? 'p-5' : 'p-3',
        className,
      )}
    >
      {(title || actions) && (
        <header className='flex items-start justify-between gap-3 mb-3'>
          <div>
            {title ? <h3 className='font-semibold text-slate-900'>{title}</h3> : null}
            {description ? <p className='text-sm text-slate-500'>{description}</p> : null}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
