'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, GraduationCap, Building, ArrowRight, ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const orgSchema = z.object({
  organizationId: z.string().min(1, 'School Code is required')
})

const authSchema = z.object({ 
  email: z.string().email('Valid email required'), 
  password: z.string().min(6, 'Password is required') 
})

type OrgValues = z.infer<typeof orgSchema>
type AuthValues = z.infer<typeof authSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  
  const [step, setStep] = useState<1 | 2>(mode === 'independent' ? 2 : 1)
  const [schoolCode, setSchoolCode] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { setUser } = useAuthStore()

  // To show success message if coming from registration
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      // Just visually confirming, toast might have already fired in register page
    }
  }, [searchParams])
  
  const orgForm = useForm<OrgValues>({ 
    resolver: zodResolver(orgSchema), 
    defaultValues: { organizationId: '' } 
  })

  const authForm = useForm<AuthValues>({ 
    resolver: zodResolver(authSchema), 
    defaultValues: { email: '', password: '' } 
  })

  const onOrgSubmit = (values: OrgValues) => {
    setSchoolCode(values.organizationId)
    setStep(2)
  }

  const onAuthSubmit = async (values: AuthValues) => {
    try {
      setLoading(true)
      // Send the schoolCode along with login request if backend is updated
      const payload = { ...values, organizationId: schoolCode }
      const response = await api.post('/auth/login', payload)
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      setUser(response.data.data.user)
      toast.success('Login successful')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Invalid credentials or school code')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
      <div className="flex flex-col items-center justify-center gap-2 mb-8">
        <div className="bg-indigo-600 p-3 rounded-xl mb-2 shadow-sm">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">EduTrack</h1>
        
        {step === 1 && <p className="text-slate-500 text-sm">Enter your organization details</p>}
        {step === 2 && (
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg mt-2 flex items-center gap-2 w-full justify-center">
            <Building className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">
              {mode === 'independent' ? 'Independent Educator' : `School: ${schoolCode}`}
            </span>
          </div>
        )}
      </div>
      
      {step === 1 ? (
        <form className="space-y-6" onSubmit={orgForm.handleSubmit(onOrgSubmit)}>
          <Input 
            label="School Code / Organization ID" 
            placeholder="e.g. DPSDELHI"
            {...orgForm.register('organizationId')} 
            error={orgForm.formState.errors.organizationId?.message} 
          />
          
          <Button 
            type="submit" 
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 text-white" 
          >
            Continue <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center pt-4 border-t border-slate-100 mt-6">
            <p className="text-sm text-slate-600">
              Don&apos;t have an organization account?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                Register School
              </Link>
            </p>
          </div>
        </form>
      ) : (
        <form className="space-y-6" onSubmit={authForm.handleSubmit(onAuthSubmit)}>
          <Input 
            label="Email Address" 
            placeholder="admin@school.com"
            {...authForm.register('email')} 
            error={authForm.formState.errors.email?.message} 
          />
          
          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-900">Password</label>
              <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  authForm.formState.errors.password ? 'border-red-500' : 'border-slate-300'
                }`}
                {...authForm.register('password')}
              />
              <button 
                type="button" 
                className="absolute right-3 top-[10px] text-slate-400 hover:text-slate-600 transition-colors" 
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {authForm.formState.errors.password && (
              <p className="mt-1 text-sm text-red-500">{authForm.formState.errors.password.message}</p>
            )}
          </div>
          
          <div className="flex gap-3">
            {mode !== 'independent' && (
              <Button 
                type="button" 
                variant="secondary"
                className="px-4"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition" 
              loading={loading}
            >
              Sign In
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto animate-bounce" />
          <p className="mt-2 text-slate-600 font-medium">Loading EduTrack...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}

