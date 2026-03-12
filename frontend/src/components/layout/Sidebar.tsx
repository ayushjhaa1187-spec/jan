'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BookOpen, ClipboardList, Download, FileText, Home, Menu, PenLine, School, UserCheck, Users, BarChart2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '../ui/Button'

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

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
]

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const visibleItems = navItems.filter((item) => item.roles.includes('all') || (user ? item.roles.includes(user.role) : false))

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // handled by local logout state reset
    } finally {
      logout()
      router.push('/login')
    }
  }

  return (
    <>
      {isMobileOpen && <div className='fixed inset-0 z-30 bg-black/40 lg:hidden' onClick={onClose} />}
      <aside className={`fixed z-40 h-full w-72 bg-[#1a365d] text-white transition-transform lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='flex items-center justify-between border-b border-white/20 p-4'>
          <div className='flex items-center gap-2 text-xl font-bold'>
            <School size={20} />
            EduTrack
          </div>
          <button className='lg:hidden' onClick={onClose}>
            <Menu size={18} />
          </button>
        </div>
        <nav className='space-y-1 p-3'>
          {visibleItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? 'bg-[#2b6cb0]' : 'hover:bg-white/10'}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className='absolute bottom-0 w-full border-t border-white/20 p-3'>
          <Button className='w-full' variant='secondary' onClick={handleLogout}>Logout</Button>
        </div>
      </aside>
    </>
  )
}
