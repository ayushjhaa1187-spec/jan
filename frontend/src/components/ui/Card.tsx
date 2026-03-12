import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
}

export function Card({
  title,
  description,
  children,
  actions,
  variant = 'default',
  className,
}: CardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-sm',
        variant === 'compact' ? 'p-3' : 'p-5',
        className,
      )}
    >
      {title || actions ? (
        <header className='mb-3 flex items-start justify-between gap-3'>
          <div>
            {title ? <h3 className='text-base font-semibold text-slate-900'>{title}</h3> : null}
            {description ? <p className='text-sm text-slate-500'>{description}</p> : null}
          </div>
          {actions}
        </header>
      ) : null}
      {children}
    </section>
  );
}
