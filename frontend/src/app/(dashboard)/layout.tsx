'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CenteredSpinner } from '@/components/ui/Spinner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="flex-1">
        <Header onMenuToggle={() => setIsMobileOpen((prev) => !prev)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
