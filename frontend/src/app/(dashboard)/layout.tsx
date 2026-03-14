'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CenteredSpinner } from '@/components/ui/Spinner'

interface MeResponse {
  data: { id: string; name: string; email: string; role: string; permissions: string[] }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoading, setLoading, setUser } = useAuthStore((state) => state)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }

    api.get<MeResponse>('/auth/me').then((response) => {
      setUser(response.data.data)
      setLoading(false)
    }).catch(() => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setLoading(false)
      router.push('/login')
    })
  }, [router, setLoading, setUser])

  if (isLoading) return <CenteredSpinner />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1">
        <Header onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
