import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
}

const variantClass = {
  primary: 'bg-primary text-white hover:bg-primary-light',
  secondary: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

const sizeClass = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  leftIcon,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type='button'
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <Spinner size='sm' color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'} /> : leftIcon}
      {children}
    </button>
  );
}
