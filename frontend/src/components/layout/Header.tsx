'use client'
import { Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { NotificationBell } from './NotificationBell'
import { Badge } from '../ui/Badge'

export function Header({ title = 'EduTrack', onMenuToggle }: { title?: string; onMenuToggle: () => void }) {
  const user = useAuthStore((s) => s.user)
  return <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={onMenuToggle}><Menu size={20} /></button><h1 className="font-semibold">{title}</h1></div><div className="flex items-center gap-3"><NotificationBell />{user ? <><span className="text-sm text-gray-700 hidden sm:block">{user.name}</span><Badge status={user.role} label={user.role} /></> : null}</div></header>
}
