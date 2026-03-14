'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BookOpen, ClipboardList, FileText, Home, LogOut, PenLine, School, UserCheck, Users, X, BarChart2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'

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
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = navItems.filter((item) => item.roles.includes('all') || item.roles.includes(user?.role ?? ''))

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      toast.error('Logout API failed, local session cleared')
    } finally {
      logout()
      router.push('/login')
      toast.success('Logged out')
    }
  }

  const content = (
    <div className="flex h-full w-64 flex-col bg-[#1a365d] text-white">
      <div className="flex items-center justify-between border-b border-white/20 p-4">
        <div>
          <h2 className="text-lg font-bold">EduTrack</h2>
          <p className="text-xs text-blue-100">Admin Console</p>
        </div>
        <button onClick={onClose} className="lg:hidden"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm', active ? 'bg-[#2b6cb0]' : 'hover:bg-white/10')}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/20 p-3">
        <p className="mb-2 text-sm">{user?.name ?? 'User'}</p>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-0 hidden h-screen lg:block">{content}</aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative h-full">{content}</div>
        </div>
      )}
    </>
  )
}
