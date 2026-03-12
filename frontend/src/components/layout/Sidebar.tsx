'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const roleMap: Record<string, string[]> = {
  Principal: ['students','classes','subjects','teachers','exams','results','reports','notifications','audit','dashboard'],
  OfficeStaff: ['students','classes','subjects','teachers','notifications','dashboard'],
  Teacher: ['results','exams','notifications','dashboard'],
  ExamDept: ['exams','results','reports','notifications','dashboard']
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const pathname = usePathname(); const router = useRouter();
  const links = ['dashboard','students','classes','subjects','teachers','exams','results','reports','notifications','audit']
    .filter((k) => roleMap[user?.role || '']?.includes(k) || k === 'dashboard')
  return <aside className='w-64 min-h-screen bg-[#1a365d] text-white p-4'><h2 className='text-xl font-bold mb-4'>EduTrack</h2><nav className='space-y-2'>{links.map((l)=><Link key={l} href={`/${l}`} className={`block rounded px-3 py-2 ${pathname.startsWith('/'+l)?'bg-[#2b6cb0]':''}`}>{l[0].toUpperCase()+l.slice(1)}</Link>)}</nav><button className='mt-6' onClick={()=>{logout();router.push('/login')}}>Logout</button></aside>
}
