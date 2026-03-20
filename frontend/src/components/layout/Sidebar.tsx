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
  { label: 'Users', href: '/users', roles: ['Principal'], icon: UserCheck },
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
    <div className="flex h-full w-64 flex-col bg-slate-950 text-white border-r border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px]" />
      </div>

      <div className="flex items-center justify-between border-b border-white/5 px-6 py-8 relative z-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white">EduTrack<span className="text-indigo-500">.</span></h1>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">Infrastructure v1.1</p>
        </div>
        <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 space-y-1 p-5 overflow-y-auto relative z-10">
        {visible.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-300 group', 
                active 
                  ? 'bg-white text-slate-950 shadow-2xl shadow-white/10' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={16} className={cn('transition-colors group-hover:scale-110', active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-white/5 p-6 bg-slate-900/50 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-4 mb-6 px-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-xl">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-black truncate text-white uppercase tracking-widest leading-none mb-1">{user?.name}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</span>
          </div>
        </div>
        <button 
          className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white/5 border border-white/5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group active:scale-95" 
          onClick={handleLogout}
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
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
