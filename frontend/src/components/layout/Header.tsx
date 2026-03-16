'use client'

import { Menu, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { NotificationBell } from './NotificationBell'

export function Header({ title = 'EduTrack', onMenuToggle }: { title?: string; onMenuToggle: () => void }) {
  const user = useAuthStore((state) => state.user)
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuToggle}><Menu size={20} /></button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs font-bold">
           <Search size={14} />
           <span>Search anything...</span>
           <span className="ml-2 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">⌘K</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 sm:block">{user.name}</span>
            <Badge status={user.role} label={user.role} />
          </div>
        ) : null}
      </div>
    </header>
  )
}
