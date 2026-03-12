'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CenteredSpinner } from '@/components/ui/Spinner'
import api from '@/lib/api'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setLoading, isLoading } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    api.get('/auth/me')
      .then((res) => {
        setUser((res.data as { data: { id: string; name: string; email: string; role: string; permissions: string[] } }).data)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push('/login')
      })
  }, [router, setLoading, setUser])

  if (isLoading) return <CenteredSpinner />

  return (
    <div className='flex h-screen bg-[#f7fafc]'>
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className='flex-1 overflow-y-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}
