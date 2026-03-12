import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='rounded-lg border bg-white px-6 py-10 text-center'>
      {icon ? <div className='mb-3 flex justify-center text-slate-400'>{icon}</div> : null}
      <h3 className='text-lg font-semibold text-slate-800'>{title}</h3>
      <p className='mt-1 text-sm text-slate-500'>{description}</p>
      {action ? (
        <button className='mt-4 rounded bg-[#1a365d] px-4 py-2 text-sm text-white' onClick={action.onClick}>
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
