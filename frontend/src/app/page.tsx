'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a365d]">
      <div className="text-white text-xl font-semibold">Loading EduTrack...</div>
    </div>
  )
}
