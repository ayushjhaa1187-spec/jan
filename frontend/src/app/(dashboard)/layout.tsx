'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { router.push('/login'); return }
    api.get('/auth/me').then((res) => setUser(res.data.data)).catch(() => {
localStorage.removeItem('accessToken'); router.push('/login') })
  }, [router, setUser])

  return <div className='flex'><Sidebar /><div className='flex-1'><Header /><main className='p-6'>{children}
</main></div></div>
}
