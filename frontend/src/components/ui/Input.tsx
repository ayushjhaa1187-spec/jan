import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label 
            htmlFor={id} 
            className="text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-md border text-sm shadow-sm transition-all duration-200 outline-none',
            'px-3 py-2.5',
            'focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
            error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-gray-500">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
