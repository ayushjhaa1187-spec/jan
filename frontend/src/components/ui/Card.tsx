import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, actions, children, className }: CardProps) {
  return (
    <div className={cn("rounded-[1.5rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40", className)}>
      {(title || actions || description) ? (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-slate-500 font-medium mt-1">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      ) : null}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}

export function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: ReactNode }) {
  return (
    <Card className="hover:shadow-2xl hover:shadow-indigo-50 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-1.5">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sync Ready</span>
      </div>
    </Card>
  )
}
