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
    <div className='rounded-lg border border-dashed bg-white p-10 text-center'>
      {icon ? <div className='mx-auto mb-4 w-fit text-slate-400'>{icon}</div> : null}
      <h3 className='text-lg font-semibold text-slate-800'>{title}</h3>
      <p className='mt-2 text-sm text-slate-500'>{description}</p>
      {action ? <Button className='mt-4' onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}
