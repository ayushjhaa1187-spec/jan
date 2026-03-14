import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label ? <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label> : null}
      <input
        id={inputId}
        ref={ref}
        className={cn('w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[#2b6cb0] focus:ring-2 focus:ring-[#2b6cb0]/20', error ? 'border-red-500' : 'border-gray-300', className)}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-xs text-gray-500">{helperText}</p> : null}
    </div>
  )
})

Input.displayName = 'Input'
