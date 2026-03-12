'use client';

import { Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { NotificationBell } from './NotificationBell';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  title?: string;
  onMenuToggle: () => void;
}

export function Header({ title = 'Dashboard', onMenuToggle }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className='flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3'>
      <div className='flex items-center gap-3'>
        <button type='button' className='rounded p-2 hover:bg-slate-100 md:hidden' onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <h1 className='text-lg font-semibold text-slate-900'>{title}</h1>
      </div>
      <div className='flex items-center gap-4'>
        <NotificationBell />
        <div className='text-right'>
          <p className='text-sm font-medium text-slate-900'>{user?.name || user?.email || 'User'}</p>
          <Badge status={user?.role || 'User'} label={user?.role || 'User'} />
        </div>
      </div>
    </header>
  );
}
