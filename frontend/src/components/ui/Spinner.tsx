import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'white';

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-[3px]',
  lg: 'h-10 w-10 border-4',
};

const colorMap: Record<SpinnerColor, string> = {
  primary: 'border-primary border-t-transparent',
  white: 'border-white border-t-transparent',
};

export function Spinner({ size = 'md', color = 'primary', className }: { size?: SpinnerSize; color?: SpinnerColor; className?: string }) {
  return <div className={cn('animate-spin rounded-full', sizeMap[size], colorMap[color], className)} />;
}

export function CenteredSpinner() {
  return (
    <div className='min-h-screen grid place-items-center'>
      <Spinner size='lg' />
    </div>
  );
}
