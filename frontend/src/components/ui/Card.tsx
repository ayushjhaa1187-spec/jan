import { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { itemVariants } from '@/lib/animations'

interface CardProps extends HTMLMotionProps<'div'> {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  animateContent?: boolean;
}

export function Card({ title, description, actions, children, className, animateContent = false, ...props }: CardProps) {
  const Component = animateContent ? motion.div : 'div'
  
  return (
    <motion.div 
      className={cn("rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40", className)}
      {...props}
    >
      {(title || actions || description) ? (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && <h3 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-slate-500 font-bold mt-1">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      ) : null}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}

export function StatCard({ title, value, icon }: { title: string; value: string | number; icon?: ReactNode }) {
  return (
    <Card 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="hover:shadow-2xl hover:shadow-indigo-100/50 transition-shadow duration-300 group cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
        {icon && (
          <div className="p-4 rounded-[1.25rem] bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-center gap-2">
         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Verified</span>
      </div>
    </Card>
  )
}
