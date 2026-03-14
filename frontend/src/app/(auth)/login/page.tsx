'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginForm = z.infer<typeof loginSchema>

interface LoginResponse {
  data: {
    user: { id: string; name: string; email: string; role: string; permissions: string[] }
    tokens: { accessToken: string; refreshToken: string }
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', values)
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken)
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken)
      setUser(response.data.data.user)
      router.push('/dashboard')
    } catch {
      toast.error('Invalid credentials')
    }
  }

  return (
    <main className="min-h-screen bg-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div className="text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-[#1a365d]" />
          <h1 className="mt-2 text-2xl font-bold">EduTrack</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" placeholder="admin@school.com" {...register('email')} error={errors.email?.message} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} {...register('password')} error={errors.password?.message} />
            <button type="button" className="absolute right-3 top-9 text-gray-500" onClick={() => setShowPassword((s) => !s)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Login</Button>
        </form>
      </div>
    </main>
  )
}
