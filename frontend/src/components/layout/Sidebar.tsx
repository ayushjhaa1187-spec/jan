'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Home, Users, School, BookOpen, UserCheck, FileText, PenLine, BarChart2, Download, Bell, ClipboardList, LogOut, X } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

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

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}
    logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const visibleItems = navItems.filter(item =>
    item.roles.includes('all') || item.roles.includes(user?.role ?? '')
  )

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1a365d] text-white w-64">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold">EduTrack</h1>
          <p className="text-xs text-blue-200 mt-0.5">Examination System</p>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.label} href={item.href} onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-[#2b6cb0] text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              )}>
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-blue-200">{user?.role}</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">{sidebarContent}</div>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  )
}
