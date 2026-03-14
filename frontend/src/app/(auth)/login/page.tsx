'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type FormValues = z.infer<typeof schema>

interface LoginResponse {
  data: {
    user: { id: string; name: string; email: string; role: string; permissions: string[] }
    tokens: { accessToken: string; refreshToken: string }
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
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
    <main className="flex min-h-screen items-center justify-center bg-[#1a365d] p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 text-center">
          <GraduationCap className="mx-auto mb-2 text-[#1a365d]" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">EduTrack</h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" placeholder="name@school.edu" {...register('email')} error={errors.email?.message} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-9 text-gray-500">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign in</Button>
        </form>
      </div>
    </main>
  )
}
