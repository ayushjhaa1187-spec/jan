import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white';
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

const colorMap = {
  primary: 'border-primary border-t-transparent',
  white: 'border-white border-t-transparent',
};

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  return <span className={cn('inline-block animate-spin rounded-full', sizeMap[size], colorMap[color], className)} />;
}

export function CenteredSpinner() {
  return (
    <div className='h-screen w-full grid place-items-center bg-[#f7fafc]'>
      <Spinner size='lg' />
    </div>
  );
}
