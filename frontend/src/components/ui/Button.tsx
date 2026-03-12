import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded px-4 py-2 bg-[#2b6cb0] text-white disabled:opacity-50', className)} {...props} />
}
