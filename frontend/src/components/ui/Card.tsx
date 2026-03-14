import { ReactNode } from 'react'

export function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {title || actions ? (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon ? <div className="text-[#1a365d]">{icon}</div> : null}
      </div>
    </Card>
  )
}
