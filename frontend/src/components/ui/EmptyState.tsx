import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='rounded-lg border bg-white p-8 text-center'>
      <div className='mb-3 flex justify-center text-slate-400'>{icon}</div>
      <h3 className='text-lg font-semibold text-slate-700'>{title}</h3>
      <p className='mt-1 text-sm text-slate-500'>{description}</p>
      {action ? <div className='mt-4'><Button onClick={action.onClick}>{action.label}</Button></div> : null}
    </div>
  );
}
