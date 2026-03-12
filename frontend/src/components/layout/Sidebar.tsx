'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Bell, BookOpen, ClipboardList, Download, FileText, Home, Menu, PenLine, School, UserCheck, Users } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home, roles: ['all'] },
  { label: 'Students', href: '/students', icon: Users, roles: ['Principal', 'OfficeStaff'] },
  { label: 'Classes', href: '/classes', icon: School, roles: ['Principal', 'OfficeStaff'] },
  { label: 'Subjects', href: '/subjects', icon: BookOpen, roles: ['Principal', 'OfficeStaff'] },
  { label: 'Teachers', href: '/teachers', icon: UserCheck, roles: ['Principal', 'OfficeStaff'] },
  { label: 'Exams', href: '/exams', icon: FileText, roles: ['Principal', 'ExamDept'] },
  { label: 'Marks Entry', href: '/exams', icon: PenLine, roles: ['Teacher', 'ExamDept'] },
  { label: 'Results', href: '/results', icon: BarChart2, roles: ['Principal', 'ExamDept', 'Teacher'] },
  { label: 'Reports', href: '/reports', icon: Download, roles: ['Principal', 'ExamDept'] },
  { label: 'Notifications', href: '/notifications', icon: Bell, roles: ['all'] },
  { label: 'Audit Log', href: '/audit', icon: ClipboardList, roles: ['Principal'] },
];

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);

  const visibleItems = navItems.filter((item) => item.roles.includes('all') || item.roles.includes(user?.role ?? ''));

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore API logout errors; local logout is authoritative for UI
    }

    logoutStore();
    router.push('/login');
  };

  return (
    <>
      {isMobileOpen ? <button className='fixed inset-0 z-40 bg-black/40 lg:hidden' onClick={onClose} aria-label='Close mobile menu' /> : null}
      <aside
        className={cn(
          'fixed z-50 inset-y-0 left-0 w-72 bg-[#1a365d] text-white border-r border-slate-800 transition-transform lg:translate-x-0 lg:static lg:z-auto',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className='h-full flex flex-col p-4'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded bg-[#2b6cb0] grid place-items-center font-bold'>E</div>
              <h2 className='text-xl font-bold'>EduTrack</h2>
            </div>
            <Button variant='ghost' className='lg:hidden text-white hover:bg-[#2b6cb0]' onClick={onClose}>
              <Menu size={18} />
            </Button>
          </div>

          <nav className='flex-1 space-y-1'>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors',
                    active ? 'bg-[#2b6cb0]' : 'hover:bg-[#2b6cb0]/70',
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button variant='secondary' className='mt-4 border-white/30 text-white bg-transparent hover:bg-[#2b6cb0]' onClick={logout}>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
