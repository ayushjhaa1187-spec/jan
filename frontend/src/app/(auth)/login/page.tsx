'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof schema>

interface LoginResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      name: string
      email: string
      role: string
      permissions: string[]
    }
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginForm) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', values)
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      setUser(response.data.data.user)
      setLoading(false)
      toast.success('Login successful')
      router.push('/dashboard')
    } catch {
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a365d] p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto mb-2 h-10 w-10 text-[#1a365d]" />
          <h1 className="text-2xl font-bold text-gray-900">EduTrack</h1>
          <p className="text-sm text-gray-600">Sign in to continue</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-[38px] text-gray-500">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
        </form>
      </div>
    </div>
  )
}
