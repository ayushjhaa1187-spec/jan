'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { GraduationCap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, isLoading } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        setInitialized(true)
        return
      }

      try {
        const response = await api.get('/auth/me')
        setUser(response.data.data)
      } catch (error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initAuth()
  }, [setUser, setLoading])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="bg-indigo-600 p-5 rounded-[2rem] shadow-2xl shadow-indigo-200 animate-bounce">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          <div className="text-center">
             <h2 className="text-2xl font-black text-slate-900 tracking-tighter">EduTrack<span className="text-indigo-600">.</span></h2>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">Initializing Secure Session</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
