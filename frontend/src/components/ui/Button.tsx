import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const variantClass = {
      primary: 'bg-[#1a365d] text-white hover:bg-[#2b6cb0] shadow-lg shadow-indigo-100',
      secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-rose-100',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
    }
    const sizeClass = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' }

    return (
      <motion.button
        ref={ref as any}
        whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:opacity-60 cursor-pointer',
          variantClass[variant],
          sizeClass[size],
          className
        )}
        {...props}
      >
        {loading ? <Spinner size="sm" /> : null}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
