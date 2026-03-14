import { cn } from '@/lib/utils'

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-4' }
  return <div className={cn('animate-spin rounded-full border-gray-200 border-t-[#1a365d]', sizeClass[size])} />
}

export function CenteredSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
