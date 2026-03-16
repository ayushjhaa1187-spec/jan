'use client'

import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, Building, ArrowRight, ArrowLeft, ShieldCheck, Zap, BarChart3, Star } from 'lucide-react'
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

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success('Registration successful! Please login.')
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
      const payload = { ...values, organizationId: schoolCode }
      const response = await api.post('/auth/login', payload)
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('refreshToken', response.data.data.refreshToken)
      setUser(response.data.data.user)
      toast.success('Welcome back to EduTrack')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Authentication failed. Please verify credentials.'
      toast.error(message)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-100 p-10 border border-white"
    >
      <div className="flex flex-col items-center justify-center gap-2 mb-10">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-100"
        >
          <GraduationCap className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">EduTrack<span className="text-indigo-600">.</span></h1>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.p 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-500 font-medium"
            >
              Enter school credentials to begin
            </motion.p>
          )}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl mt-2 flex items-center gap-2 w-full justify-center"
            >
              <Building className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-900">
                {mode === 'independent' ? 'Independent Educator' : `School: ${schoolCode}`}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form 
            key="orgForm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6" 
            onSubmit={orgForm.handleSubmit(onOrgSubmit)}
          >
            <Input 
              label="Institutional School Code" 
              placeholder="e.g. DPSDELHI"
              className="rounded-xl border-slate-200 focus:ring-indigo-500 h-12"
              {...orgForm.register('organizationId')} 
              error={orgForm.formState.errors.organizationId?.message} 
            />
            
            <Button 
              type="submit" 
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg shadow-indigo-100 active:scale-95" 
            >
              Continue <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="text-center pt-8 border-t border-slate-100 mt-6">
              <p className="text-sm text-slate-500 font-medium">
                New to EduTrack?{' '}
                <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition">
                  Create Institution Account
                </Link>
              </p>
            </div>
          </motion.form>
        ) : (
          <motion.form 
            key="authForm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6" 
            onSubmit={authForm.handleSubmit(onAuthSubmit)}
          >
            <Input 
              label="Administrator Email" 
              placeholder="admin@school.com"
              className="rounded-xl border-slate-200 h-12"
              {...authForm.register('email')} 
              error={authForm.formState.errors.email?.message} 
            />
            
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link href="#" className="text-xs text-indigo-600 hover:text-indigo-500 font-bold uppercase tracking-widest">
                  Reset?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    authForm.formState.errors.password ? 'border-red-500' : 'border-slate-200'
                  }`}
                  {...authForm.register('password')}
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-[14px] text-slate-400 hover:text-slate-600 transition-colors" 
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {authForm.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-bold">{authForm.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="flex gap-4">
              {mode !== 'independent' && (
                <Button 
                  type="button" 
                  variant="secondary"
                  className="px-6 rounded-xl border-slate-200"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <Button 
                type="submit" 
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-100 active:scale-95" 
                loading={loading}
              >
                Sign In
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Benefits() {
  return (
    <div className="hidden lg:flex flex-col justify-center max-w-lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
          Enterprise Ready
        </div>
        <h2 className="text-5xl font-black text-slate-900 mb-8 leading-[1.1]">The smart way to <br /> manage academic <br /> governance.</h2>
        
        <div className="space-y-8">
          {[
            { icon: ShieldCheck, title: 'Multi-Tenant Security', desc: 'Encrypted isolation for every academic institution.' },
            { icon: Zap, title: 'Real-time Processing', desc: 'Instant result calculation and ranking algorithm.' },
            { icon: BarChart3, title: 'Deep Performance Analysis', desc: 'Visualize student progress with interactive charts.' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex gap-5"
            >
              <div className="bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 h-fit">
                <item.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="mt-16 p-6 rounded-3xl bg-indigo-600 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Star className="w-12 h-12 fill-white" />
          </div>
          <p className="font-bold text-lg mb-4 italic">&quot;EduTrack has reduced our result processing time by over 80%. It is indispensable.&quot;</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-400" />
            <div>
              <div className="font-bold text-sm">Sr. Principal Mehta</div>
              <div className="text-xs text-indigo-200">Global International School</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100/50 -skew-x-12 translate-x-32 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-12 lg:py-0 gap-20">
        <Benefits />
        <div className="flex-1 flex items-center justify-center relative">
          <Suspense fallback={
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto animate-bounce" />
              <p className="mt-4 text-slate-900 font-black text-xl tracking-tight">System Booting...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}


