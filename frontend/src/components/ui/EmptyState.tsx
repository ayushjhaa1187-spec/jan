import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center'>
      <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500'>
        {icon}
      </div>
      <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
      <p className='mt-2 text-sm text-slate-500'>{description}</p>
      {action ? (
        <div className='mt-4'>
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      ) : null}
    </div>
  );
}
