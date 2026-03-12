import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  const colorMap = { primary: 'border-[#2b6cb0]', white: 'border-white' };

  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-t-transparent',
        sizeMap[size],
        colorMap[color],
        className,
      )}
    />
  );
}

export function CenteredSpinner() {
  return (
    <div className='min-h-screen w-full grid place-items-center'>
      <Spinner size='lg' />
    </div>
  );
}
