'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, User, ArrowRight, ArrowLeft, GraduationCap, CheckCircle2, ShieldCheck, Zap, Globe, Star } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schoolSchema = z.object({
  schoolName: z.string().min(3, 'School name is required'),
  board: z.string().min(1, 'Board is required'),
  schoolCode: z.string().min(3, 'School code is required (e.g., DPSDELHI)'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  phone: z.string().min(10, 'Valid phone is required'),
})

const adminSchema = z.object({
  adminName: z.string().min(3, 'Admin name is required'),
  email: z.string().email('Invalid email address'),
  adminPhone: z.string().min(10, 'Valid phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

function BenefitItem({ title, desc }: { title: string; desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 items-start"
    >
      <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
        <CheckCircle2 className="w-5 h-5 text-indigo-300" />
      </div>
      <div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-indigo-200 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function RegisterSchool() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [schoolData, setSchoolData] = useState<z.infer<typeof schoolSchema> | null>(null)

  const schoolForm = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
  })

  const adminForm = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
  })

  const onSchoolSubmit = (data: z.infer<typeof schoolSchema>) => {
    setSchoolData(data)
    setStep(2)
  }

  const onAdminSubmit = async (data: z.infer<typeof adminSchema>) => {
    if (!schoolData) return
    setLoading(true)
    try {
      const payload = {
        organization: {
          name: schoolData.schoolName,
          schoolCode: schoolData.schoolCode,
          board: schoolData.board,
          address: `${schoolData.city}, ${schoolData.state}`
        },
        admin: {
          name: data.adminName,
          email: data.email,
          password: data.password
        }
      }
      await api.post('/auth/register', payload)
      toast.success('Institution registered successfully!')
      router.push('/login?registered=true')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left side: Branding & Benefits */}
      <div className="hidden lg:flex flex-col w-[42%] bg-slate-950 p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-24 relative z-10"
        >
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-2xl shadow-indigo-500/20">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-black text-white tracking-tighter">EduTrack<span className="text-indigo-500">.</span></span>
        </motion.div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10 w-fit"
          >
            System Infrastructure v1.1
          </motion.div>
          <h1 className="text-6xl font-black text-white mb-10 leading-[1.1] tracking-tighter">Scale your <br /> academic <br /> governance.</h1>
          
          <div className="space-y-12 max-w-sm">
            <BenefitItem title="Military-Grade Security" desc="ISO 27001 compliant multi-tenant encryption silos." />
            <BenefitItem title="Industrial RAG Pipeline" desc="AI-driven insights from historical student performance data." />
            <BenefitItem title="Automated Vaulting" desc="Zero-latency result processing and immutable audit logs." />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto relative z-10 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div className="flex gap-1.5 mb-5">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />)}
          </div>
          <p className="text-slate-300 text-lg italic mb-6 font-medium leading-relaxed">&quot;The absolute benchmark for large-scale institutional management. Zero friction.&quot;</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500" />
            <div>
               <div className="text-xs font-black text-white uppercase tracking-widest">Global Academy Principal</div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Partner</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24 bg-slate-50 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#ffffff_100%)] opacity-50" />
        
        <div className="absolute top-0 right-0 p-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
                 <GraduationCap className="h-6 w-6 text-indigo-600" />
                 <span className="text-xl font-black text-slate-950 uppercase">EduTrack</span>
            </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl relative z-10"
          >
            <div className="mb-12 text-center lg:text-left">
              <h2 className="text-5xl font-black text-slate-950 mb-3 tracking-tighter">
                {step === 1 ? 'Institutional Identity.' : 'Security Configuration.'}
              </h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Deploying to Production Cluster v1.1.0</p>
              
              <div className="flex gap-3 mt-8 justify-center lg:justify-start">
                 <div className={`h-1 w-16 rounded-full transition-all duration-500 ${step === 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                 <div className={`h-1 w-16 rounded-full transition-all duration-500 ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-2xl p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-50" />

              {step === 1 ? (
                <form onSubmit={schoolForm.handleSubmit(onSchoolSubmit)} className="space-y-6">
                  <Input
                    label="Full Name of Institution"
                    placeholder="Delhi Public School"
                    className="h-12 rounded-xl"
                    error={schoolForm.formState.errors.schoolName?.message}
                    {...schoolForm.register('schoolName')}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Education Board"
                      placeholder="CBSE / ICSE / State"
                      className="h-12 rounded-xl"
                      error={schoolForm.formState.errors.board?.message}
                      {...schoolForm.register('board')}
                    />
                    <Input
                      label="Unique School Code"
                      placeholder="DPSDELHI"
                      className="h-12 rounded-xl"
                      error={schoolForm.formState.errors.schoolCode?.message}
                      {...schoolForm.register('schoolCode')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="City"
                      placeholder="New Delhi"
                      className="h-12 rounded-xl"
                      error={schoolForm.formState.errors.city?.message}
                      {...schoolForm.register('city')}
                    />
                    <Input
                      label="State / Province"
                      placeholder="Delhi"
                      className="h-12 rounded-xl"
                      error={schoolForm.formState.errors.state?.message}
                      {...schoolForm.register('state')}
                    />
                  </div>

                  <Input
                    label="Official Contact Number"
                    placeholder="+91 XXXXX XXXXX"
                    className="h-12 rounded-xl"
                    error={schoolForm.formState.errors.phone?.message}
                    {...schoolForm.register('phone')}
                  />

                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                      className="w-full py-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 transition-all"
                    >
                      Authenticate and Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                  <Input
                    label="Principal / Admin Full Name"
                    placeholder="Raj Kumar"
                    className="h-12 rounded-xl"
                    error={adminForm.formState.errors.adminName?.message}
                    {...adminForm.register('adminName')}
                  />
                  
                  <Input
                    label="Administrator Work Email"
                    type="email"
                    placeholder="admin@school.com"
                    className="h-12 rounded-xl"
                    error={adminForm.formState.errors.email?.message}
                    {...adminForm.register('email')}
                  />

                  <Input
                    label="Direct Contact Number"
                    placeholder="+91 XXXXX XXXXX"
                    className="h-12 rounded-xl"
                    error={adminForm.formState.errors.adminPhone?.message}
                    {...adminForm.register('adminPhone')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Secure Password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl"
                      error={adminForm.formState.errors.password?.message}
                      {...adminForm.register('password')}
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl"
                      error={adminForm.formState.errors.confirmPassword?.message}
                      {...adminForm.register('confirmPassword')}
                    />
                  </div>

                  <div className="pt-6 flex gap-4">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setStep(1)}
                      className="px-8 rounded-[1.5rem] border-slate-200"
                    >
                      <ArrowLeft className="h-5 w-5 font-black text-slate-400" />
                    </Button>
                    <Button 
                      type="submit" 
                      loading={loading} 
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                      className="w-full py-8 bg-slate-950 hover:bg-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white shadow-2xl shadow-slate-200 transition-all"
                    >
                      Complete Infrastructure Setup
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-10 text-center pt-8 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-medium">
                  Already have an organization?{' '}
                  <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Sign in to your dashboard
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

