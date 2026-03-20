import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-2.5">
        {label && (
          <label 
            htmlFor={id} 
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full rounded-[1.2rem] border text-xs font-bold shadow-sm transition-all duration-300 outline-none',
            'px-5 py-4',
            'bg-slate-50 border-slate-200 text-slate-950 placeholder:text-slate-400',
            'focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:shadow-xl focus:shadow-indigo-50/50',
            error ? 'border-rose-500 bg-rose-50/50 text-rose-900' : '',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight ml-1">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
