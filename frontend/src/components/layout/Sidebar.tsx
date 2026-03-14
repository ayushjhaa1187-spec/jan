'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, BookOpen, ClipboardList, Download, FileText, Home, LogOut, PenLine, School, UserCheck, Users, X } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

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

export function Sidebar({ isMobileOpen, onClose }: { isMobileOpen: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pathname = usePathname()
  const router = useRouter()
  const visible = navItems.filter((item) => item.roles.includes('all') || item.roles.includes(user?.role ?? ''))

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      toast.error('Server logout failed, clearing local session')
    }
    logout()
    router.push('/login')
  }

  const content = <div className="h-full w-64 bg-[#1a365d] text-white flex flex-col"><div className="px-5 py-4 border-b border-white/10 flex justify-between"><h2 className="font-bold">EduTrack</h2><button onClick={onClose} className="lg:hidden"><X size={18} /></button></div><nav className="flex-1 p-3 space-y-1">{visible.map((item) => {const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link onClick={onClose} key={item.label} href={item.href} className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm', active ? 'bg-[#2b6cb0]' : 'hover:bg-white/10')}><Icon size={16} />{item.label}</Link>})}</nav><div className="p-3 border-t border-white/10"><button onClick={handleLogout} className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2"><LogOut size={16} />Logout</button></div></div>

  return <>
    <div className="hidden lg:block shrink-0">{content}</div>
    {isMobileOpen ? <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="close" className="absolute inset-0 bg-black/40" onClick={onClose} /><div className="relative z-10">{content}</div></div> : null}
  </>
}
