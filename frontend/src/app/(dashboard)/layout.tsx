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
  const setUser = useAuthStore((state) => state.setUser)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

    if (!token) {
      router.push('/login')
      return
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.data)
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        router.push('/login')
      })
  }, [router, setUser])

  return (
    <div className="flex min-h-screen bg-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#f8fafc_0%,#ffffff_100%)] pointer-events-none" />
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="flex-1 relative z-10">
        <Header onMenuToggle={() => setIsMobileOpen((prev) => !prev)} />
        <main className="p-10">{children}</main>
      </div>
    </div>
  )
}
