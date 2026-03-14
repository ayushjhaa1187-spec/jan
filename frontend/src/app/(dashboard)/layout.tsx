'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CenteredSpinner } from '@/components/ui/Spinner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isLoading, setLoading, setUser } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      router.replace('/login')
      return
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.data)
        setLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setLoading(false)
        router.replace('/login')
      })
  }, [router, setLoading, setUser])

  if (isLoading) return <CenteredSpinner />

  return <div className="flex min-h-screen"><Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} /><div className="flex-1"><Header onMenuToggle={() => setIsMobileOpen((v) => !v)} /><main className="p-6">{children}</main></div></div>
}
