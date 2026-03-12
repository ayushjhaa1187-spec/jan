'use client';

import { BarChart2, Bell, BookOpen, ClipboardList, Download, FileText, Home, PenLine, School, UserCheck, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
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
] as const;

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);

  const allowed = navItems.filter((item) => item.roles.includes('all') || item.roles.includes(user?.role ?? ''));

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout API failure
    }

    logoutStore();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <>
      <aside className={cn('fixed inset-y-0 left-0 z-50 w-72 bg-[#1a365d] text-white transition-transform lg:static lg:translate-x-0', isMobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className='flex h-16 items-center justify-between border-b border-white/20 px-4'>
          <h2 className='text-xl font-bold'>EduTrack</h2>
          <button type='button' className='rounded p-2 hover:bg-white/10 lg:hidden' onClick={onClose}><X size={18} /></button>
        </div>

        <nav className='space-y-1 p-3'>
          {allowed.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.label} href={item.href} onClick={onClose} className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm', active ? 'bg-[#2b6cb0]' : 'hover:bg-white/10')}>
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='absolute bottom-0 w-full border-t border-white/20 p-3'>
          <button type='button' className='w-full rounded-md bg-red-600 px-3 py-2 text-sm hover:bg-red-700' onClick={logout}>Logout</button>
        </div>
      </aside>
      {isMobileOpen ? <div className='fixed inset-0 z-40 bg-black/40 lg:hidden' onClick={onClose} /> : null}
    </>
  );
}
