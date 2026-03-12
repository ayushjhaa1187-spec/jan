import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full border rounded px-3 py-2', props.className)} />
}
