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
      primary: 'bg-slate-950 text-white hover:bg-slate-900 shadow-2xl shadow-slate-200/50 uppercase tracking-[0.2em] font-black',
      secondary: 'border border-slate-200 bg-white text-slate-950 hover:bg-slate-50 shadow-sm uppercase tracking-widest font-black',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-2xl shadow-rose-100 uppercase tracking-widest font-black',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-950 uppercase tracking-widest font-black'
    }
    const sizeClass = { 
      sm: 'h-10 px-5 text-[9px]', 
      md: 'h-12 px-6 text-[10px]', 
      lg: 'h-14 px-10 text-[11px]' 
    }

    return (
      <motion.button
        ref={ref as any}
        whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.96 } : undefined}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-3 rounded-[1.2rem] transition-all duration-300 disabled:opacity-50 cursor-pointer border-none outline-none',
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
