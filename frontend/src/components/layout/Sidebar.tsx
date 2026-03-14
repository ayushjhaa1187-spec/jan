'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BookOpen, ClipboardList, FileText, Home, LogOut, PenLine, School, UserCheck, Users, X, BarChart2, Download } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', roles: ['all'], icon: Home },
  { label: 'Students', href: '/students', roles: ['Principal', 'OfficeStaff'], icon: Users },
  { label: 'Classes', href: '/classes', roles: ['Principal', 'OfficeStaff'], icon: School },
  { label: 'Subjects', href: '/subjects', roles: ['Principal', 'OfficeStaff'], icon: BookOpen },
  { label: 'Teachers', href: '/teachers', roles: ['Principal', 'OfficeStaff'], icon: UserCheck },
  { label: 'Exams', href: '/exams', roles: ['Principal', 'ExamDept'], icon: FileText },
  { label: 'Marks Entry', href: '/exams', roles: ['Teacher', 'ExamDept'], icon: PenLine },
  { label: 'Results', href: '/results', roles: ['Principal', 'ExamDept', 'Teacher'], icon: ClipboardList },
  { label: 'Reports', href: '/reports', roles: ['Principal', 'ExamDept'], icon: Download },
  { label: 'Notifications', href: '/notifications', roles: ['all'], icon: Bell },
  { label: 'Audit Log', href: '/audit', roles: ['Principal'], icon: ClipboardList },
]

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const pathname = usePathname()
  const router = useRouter()

  const visible = navItems.filter((item) => 
    item.roles.includes('all') || item.roles.includes(user?.role ?? '')
  )

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore backend logout failure
    }
    logout()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  const content = (
    <div className="flex h-full w-64 flex-col bg-[#1a365d] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">EduTrack</h1>
          <p className="text-xs text-blue-300 uppercase mt-0.5">Academic OS</p>
        </div>
        <button className="lg:hidden p-2 hover:bg-white/10 rounded-md" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {visible.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200', 
                active 
                  ? 'bg-[#2b6cb0] text-white shadow-md' 
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-blue-300'} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-white/10 p-4 bg-[#162e4f]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className="text-[10px] text-blue-300 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
        <button 
          className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-900/40 hover:text-white transition-colors" 
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="sticky top-0 hidden h-screen lg:block shadow-2xl z-20">{content}</aside>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/60 lg:hidden backdrop-blur-sm" onClick={onClose}>
          <div className="h-full w-64 animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      ) : null}
    </>
  )
}
