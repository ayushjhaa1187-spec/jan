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
      className="w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 p-12 border border-white/50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <div className="flex flex-col items-center justify-center gap-2 mb-10">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="bg-gradient-to-br from-indigo-600 to-violet-600 p-4 rounded-2xl mb-4 shadow-lg shadow-indigo-100"
        >
          <GraduationCap className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-950 tracking-tighter">EduTrack<span className="text-indigo-600">.</span></h1>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.p 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2"
            >
              Institutional Gateway v1.1
            </motion.p>
          )}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-950 px-4 py-2 rounded-xl mt-4 flex items-center gap-2 w-full justify-center shadow-lg"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {mode === 'independent' ? 'Independent Educator' : `ORG: ${schoolCode}`}
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
              whileTap={{ scale: 0.96 }}
              whileHover={{ y: -2 }}
              className="w-full py-7 bg-slate-950 hover:bg-slate-900 rounded-2xl transition-all flex items-center justify-center gap-3 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200/50" 
            >
              Initialize Session <ArrowRight className="w-4 h-4" />
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
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -2 }}
                className="w-full py-7 bg-slate-950 hover:bg-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-slate-200/50" 
                loading={loading}
              >
                Authenticate User
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
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex gap-6 group"
            >
              <div className="bg-white p-4 rounded-[1.5rem] shadow-2xl shadow-slate-100 border border-slate-50 h-fit group-hover:scale-110 group-hover:bg-slate-950 group-hover:text-white transition-all duration-300">
                <item.icon className="w-6 h-6 text-indigo-600 group-hover:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-black text-slate-950 mb-1 tracking-tight">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed font-bold uppercase tracking-tight opacity-80">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.6 }}
           className="mt-16 p-10 rounded-[2.5rem] bg-slate-950 text-white relative overflow-hidden shadow-2xl shadow-indigo-100"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Star className="w-16 h-16 fill-white" />
          </div>
          <p className="font-black text-xl mb-6 italic leading-relaxed tracking-tight relative z-10">&quot;The absolute benchmark for academic governance and information security.&quot;</p>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl" />
            <div>
              <div className="font-black text-sm uppercase tracking-widest text-white">Sr. Principal Mehta</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Global International School</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#f8fafc_0%,#ffffff_100%)]" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-32 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />


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


