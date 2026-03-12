import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg'
type SpinnerColor = 'primary' | 'white'

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

const colorMap: Record<SpinnerColor, string> = {
  primary: 'border-primary border-t-transparent',
  white: 'border-white border-t-transparent',
}

export function Spinner({ size = 'md', color = 'primary', className }: { size?: SpinnerSize; color?: SpinnerColor; className?: string }) {
  return <span className={cn('inline-block animate-spin rounded-full border-2', sizeMap[size], colorMap[color], className)} />
}

export function CenteredSpinner() {
  return <div className='min-h-screen grid place-items-center bg-[#f7fafc]'><Spinner size='lg' /></div>
}
