'use client'

import { Menu } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'

export function Header({ title = 'EduTrack', onMenuToggle }: { title?: string; onMenuToggle: () => void }) {
  const user = useAuthStore((state) => state.user)
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={onMenuToggle}><Menu className="h-5 w-5" /></button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <span className="hidden text-sm text-gray-700 sm:block">{user?.name}</span>
        <Badge status={user?.role ?? 'USER'} label={user?.role ?? 'User'} />
      </div>
    </header>
  )
}
