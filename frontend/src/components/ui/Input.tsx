import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className='space-y-1'>
        {label ? <label htmlFor={inputId} className='text-sm font-medium text-slate-700'>{label}</label> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-shadow',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-slate-300 focus:ring-2 focus:ring-blue-200',
            className,
          )}
          {...props}
        />
        {error ? <p className='text-xs text-red-600'>{error}</p> : null}
        {!error && helperText ? <p className='text-xs text-slate-500'>{helperText}</p> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
