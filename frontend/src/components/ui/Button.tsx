import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-[#1a365d] text-white hover:bg-[#2b6cb0]',
  secondary: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size='sm' color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} /> : null}
      {children}
    </button>
  );
}
