import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className, id, ...props },
  ref
) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        ref={ref}
        className={cn('w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]/40', error ? 'border-red-500' : 'border-gray-300', className)}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : helperText ? <p className="text-sm text-gray-500">{helperText}</p> : null}
    </div>
  )
})
