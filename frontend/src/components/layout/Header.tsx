'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '../ui/Badge'

export function Header({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const title = pathname.split('/').filter(Boolean)[0] || 'dashboard'

  return (
    <header className='flex items-center justify-between border-b bg-white px-4 py-3'>
      <div className='flex items-center gap-3'>
        <button className='lg:hidden' onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <h1 className='text-lg font-semibold capitalize'>{title}</h1>
      </div>
      <div className='flex items-center gap-3'>
        <NotificationBell />
        <div className='text-right text-sm'>
          <p className='font-medium'>{user?.name || 'User'}</p>
          <Badge status='APPROVED' label={user?.role || 'Role'} />
        </div>
      </div>
    </header>
  )
}
