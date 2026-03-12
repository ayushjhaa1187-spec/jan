import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-[#1a365d] text-white hover:bg-[#2b6cb0]',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2b6cb0] disabled:opacity-60 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {loading && <Spinner size='sm' color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} />}
      {children}
    </button>
  )
}
