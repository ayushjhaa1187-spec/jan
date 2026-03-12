'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

type LoginResponse = {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: { id: string; name: string; email: string; role: string; permissions: string[] }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setErrorMessage('')
      const { data } = await api.post<LoginResponse>('/auth/login', values)
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('refreshToken', data.data.refreshToken)
      setUser(data.data.user)
      toast.success('Login successful')
      router.push('/dashboard')
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { error?: string } | undefined)?.error ?? 'Login failed'
          : 'Login failed'
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <main className='min-h-screen bg-[#1a365d] grid place-items-center p-4'>
      <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-2xl'>
        <h1 className='text-center text-3xl font-bold text-[#1a365d]'>EduTrack</h1>
        <p className='mt-1 text-center text-sm text-gray-500'>Examination Management System</p>
        <div className='my-5 h-px bg-slate-200' />

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <Input label='Email' type='email' placeholder='admin@school.com' error={errors.email?.message} {...register('email')} />
          <div className='relative'>
            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              error={errors.password?.message}
              {...register('password')}
            />
            <button type='button' className='absolute right-3 top-9 text-slate-500' onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {errorMessage ? <p className='text-sm text-red-600'>{errorMessage}</p> : null}

          <Button type='submit' className='w-full' loading={isSubmitting}>Sign In</Button>
        </form>
      </div>
    </main>
  )
}
