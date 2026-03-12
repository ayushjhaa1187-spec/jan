'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '../ui/Badge';
import { NotificationBell } from './NotificationBell';

export function Header({ title, onMenuToggle }: { title?: string; onMenuToggle: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const pageTitle = title ?? pathname.split('/')[1]?.replace(/-/g, ' ') ?? 'Dashboard';

  return (
    <header className='flex items-center justify-between border-b bg-white px-4 py-3'>
      <div className='flex items-center gap-3'>
        <button className='rounded p-2 hover:bg-slate-100 lg:hidden' onClick={onMenuToggle} type='button'>
          <Menu size={20} />
        </button>
        <h1 className='text-lg font-semibold capitalize'>{pageTitle}</h1>
      </div>

      <div className='flex items-center gap-4'>
        <NotificationBell />
        <div className='text-right'>
          <p className='text-sm font-semibold'>{user?.name ?? user?.email ?? 'User'}</p>
          <Badge status={user?.role ?? 'User'} label={user?.role ?? 'User'} />
        </div>
      </div>
    </header>
  );
}
