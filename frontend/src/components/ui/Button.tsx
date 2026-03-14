import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const variantClass = {
      primary: 'bg-[#1a365d] text-white hover:bg-[#2b6cb0]',
      secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
    }
    const sizeClass = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60', variantClass[variant], sizeClass[size], className)}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
