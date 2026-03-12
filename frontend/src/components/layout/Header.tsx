'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  title?: string;
  onMenuToggle: () => void;
}

const toTitle = (path: string): string => {
  if (!path || path === '/') return 'Dashboard';
  const segment = path.split('/').filter(Boolean)[0] || 'dashboard';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function Header({ title, onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <header className='h-16 border-b bg-white px-4 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' className='lg:hidden' onClick={onMenuToggle}>
          <Menu size={18} />
        </Button>
        <h1 className='text-lg font-semibold text-slate-800'>{title ?? toTitle(pathname)}</h1>
      </div>

      <div className='flex items-center gap-3'>
        <NotificationBell />
        <div className='text-right'>
          <p className='text-sm font-medium'>{user?.name ?? 'User'}</p>
          <Badge status='DRAFT' label={user?.role ?? 'Guest'} />
        </div>
      </div>
    </header>
  );
}
