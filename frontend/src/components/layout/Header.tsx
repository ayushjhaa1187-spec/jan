'use client'
import { Menu } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'

interface HeaderProps {
  title?: string
  onMenuToggle: () => void
}

export function Header({ title = 'EduTrack', onMenuToggle }: HeaderProps) {
  const { user } = useAuthStore()
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell />
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
            <Badge status={user.role} label={user.role} />
          </div>
        )}
      </div>
    </header>
  )
}
