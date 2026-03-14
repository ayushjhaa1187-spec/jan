'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'

const schema = z.object({ email: z.string().email('Valid email required'), password: z.string().min(6, 'Password is required') })
type Values = z.infer<typeof schema>

interface LoginResponse {
  data: {
    user: { id: string; name: string; email: string; role: string; permissions: string[] }
    tokens: { accessToken: string; refreshToken: string }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { setUser, setLoading } = useAuthStore()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  return <div className="min-h-screen bg-[#1a365d] flex items-center justify-center p-4"><div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6"><div className="flex items-center justify-center gap-2 mb-6"><GraduationCap className="w-7 h-7 text-[#1a365d]" /><h1 className="text-2xl font-bold text-[#1a365d]">EduTrack</h1></div><form className="space-y-4" onSubmit={form.handleSubmit(async (values) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', values)
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      setUser(response.data.data.user)
      toast.success('Logged in')
      router.push('/dashboard')
    } catch {
      toast.error('Invalid credentials')
    } finally { setLoading(false) }
  })}><Input label="Email" {...form.register('email')} error={form.formState.errors.email?.message} /><div className="relative"><Input label="Password" type={showPassword ? 'text' : 'password'} {...form.register('password')} error={form.formState.errors.password?.message} /><button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div><Button type="submit" className="w-full" loading={form.formState.isSubmitting}>Sign In</Button></form></div></div>
}
