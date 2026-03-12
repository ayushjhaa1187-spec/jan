import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className, id, ...props },
  ref,
) {
  return (
    <div className='space-y-1'>
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-slate-700'>
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[#2b6cb0] focus:border-[#2b6cb0]',
          error ? 'border-red-500' : 'border-slate-300',
          className,
        )}
        {...props}
      />
      {error ? <p className='text-xs text-red-600'>{error}</p> : helperText ? <p className='text-xs text-slate-500'>{helperText}</p> : null}
    </div>
  )
})
