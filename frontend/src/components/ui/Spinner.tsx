import { cn } from '@/lib/utils'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-8 w-8 border-4' : 'h-6 w-6 border-2'
  return <div className={cn('animate-spin rounded-full border-gray-300 border-t-[#1a365d]', cls)} />
}

export function CenteredSpinner() {
  return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>
}
