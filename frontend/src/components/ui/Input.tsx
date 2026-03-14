import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, helperText, className, ...props }, ref) {
  return (
    <div className="space-y-1">
      {label ? <label className="text-sm font-medium text-gray-700">{label}</label> : null}
      <input
        ref={ref}
        className={cn('w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2b6cb0]', error ? 'border-red-500' : 'border-gray-300', className)}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
})
