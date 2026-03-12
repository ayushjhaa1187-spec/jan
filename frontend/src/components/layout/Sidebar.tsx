'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Bell,
  BookOpen,
  ClipboardList,
  Download,
  FileText,
  Home,
  PenLine,
  School,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  roles: string[];
};

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

  const role = user?.role || '';
  const visibleItems = navItems.filter((item) => item.roles.includes('all') || item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout API failures
    } finally {
      logoutStore();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  return (
    <>
      <div
        className={cn('fixed inset-0 z-30 bg-slate-950/50 md:hidden', isMobileOpen ? 'block' : 'hidden')}
        onClick={onClose}
        role='presentation'
      />

      <aside
        className={cn(
          'fixed z-40 flex h-screen w-64 flex-col bg-primary text-white transition-transform md:static md:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className='flex items-center justify-between border-b border-white/20 px-4 py-4'>
          <div>
            <p className='text-lg font-bold'>EduTrack</p>
            <p className='text-xs text-white/70'>Examination Management</p>
          </div>
          <button type='button' className='rounded p-1 hover:bg-white/20 md:hidden' onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className='flex-1 space-y-1 px-3 py-4'>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/90 transition hover:bg-primary-light/70',
                  active ? 'bg-[#2b6cb0] text-white' : '',
                )}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className='border-t border-white/20 p-3'>
          <button type='button' onClick={handleLogout} className='w-full rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20'>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
