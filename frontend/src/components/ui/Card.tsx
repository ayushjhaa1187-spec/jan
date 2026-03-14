import { cn } from '@/lib/utils'

interface CardProps { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }
export function Card({ title, actions, children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm p-5', className)}>
      {title || actions ? <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-gray-800">{title}</h3><div>{actions}</div></div> : null}
      {children}
    </div>
  )
}

export function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return <Card><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{title}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value}</p></div><div>{icon}</div></div></Card>
}
