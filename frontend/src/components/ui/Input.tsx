import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className='space-y-1'>
        {label ? <label htmlFor={inputId} className='text-sm font-medium text-slate-700'>{label}</label> : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-md border px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2',
            error
              ? 'border-danger focus:border-danger focus:ring-red-200'
              : 'border-slate-300 focus:border-primary-light focus:ring-blue-200',
            className,
          )}
          {...props}
        />
        {error ? <p className='text-xs text-danger'>{error}</p> : null}
        {!error && helperText ? <p className='text-xs text-slate-500'>{helperText}</p> : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
