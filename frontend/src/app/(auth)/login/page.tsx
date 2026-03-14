'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({ 
  email: z.string().email('Valid email required'), 
  password: z.string().min(6, 'Password is required') 
})
type Values = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { setUser, setLoading } = useAuthStore()
  
  const form = useForm<Values>({ 
    resolver: zodResolver(schema), 
    defaultValues: { email: '', password: '' } 
  })

  const onSubmit = async (values: Values) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', values)
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      setUser(response.data.data.user)
      toast.success('Login successful')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Invalid credentials or server error')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-12 h-12 text-[#1a365d]" />
          <h1 className="text-3xl font-bold text-[#1a365d]">EduTrack</h1>
          <p className="text-gray-500 text-sm">Sign in to manage your school</p>
        </div>
        
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Input 
            label="Email Address" 
            placeholder="admin@edutrack.com"
            {...form.register('email')} 
            error={form.formState.errors.email?.message} 
          />
          
          <div className="relative">
            <Input 
              label="Password" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="••••••••"
              {...form.register('password')} 
              error={form.formState.errors.password?.message} 
            />
            <button 
              type="button" 
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors" 
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-3 bg-[#1a365d] hover:bg-[#2c5282] transition-colors" 
            loading={form.formState.isSubmitting}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}
