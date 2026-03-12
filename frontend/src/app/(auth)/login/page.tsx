'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter(); const setUser = useAuthStore((s) => s.setUser)
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const { data } = await api.post('/auth/login', values)
      localStorage.setItem('accessToken', data.data.tokens.accessToken)
      setUser(data.data.user)
      toast.success('Logged in successfully')
      router.push('/dashboard')
    } catch {
      toast.error('Login failed')
    }
  }

  return <main className='min-h-screen grid place-items-center bg-[#1a365d] p-4'>
    <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded shadow p-6 w-full max-w-md space-y-4'>
      <div className='text-center text-2xl font-bold'>EduTrack</div>
      <Input placeholder='Email' {...register('email')} />
      {errors.email && <p className='text-sm text-red-600'>Valid email required</p>}
      <Input placeholder='Password' type='password' {...register('password')} />
      {errors.password && <p className='text-sm text-red-600'>Password min 6 characters</p>}
      <Button type='submit' className='w-full' disabled={isSubmitting}>{isSubmitting ? <Spinner /> : 'Login'}</Button>
    </form>
  </main>
}
