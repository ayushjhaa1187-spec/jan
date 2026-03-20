'use client'

import { Menu, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { NotificationBell } from './NotificationBell'

export function Header({ title = 'Infrastructure', onMenuToggle }: { title?: string; onMenuToggle: () => void }) {
  const user = useAuthStore((state) => state.user)
  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-xl px-8 py-6 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <button className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors" onClick={onMenuToggle}><Menu size={20} /></button>
        <h2 className="text-xl font-black text-slate-950 tracking-tighter uppercase">{title}</h2>
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-[1.2rem] text-slate-400 text-[10px] font-black uppercase tracking-widest focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
           <Search size={14} className="text-slate-400" />
           <input type="text" placeholder="Omni-search cluster..." className="bg-transparent border-none outline-none w-48 text-slate-950 placeholder:text-slate-400" />
           <span className="ml-4 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] shadow-sm">⌘K</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <NotificationBell />
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{user.name}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-950 font-black text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}
