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
      <div className="hidden lg:flex flex-col w-[40%] bg-slate-900 p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-16 relative z-10"
        >
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">EduTrack<span className="text-indigo-500">.</span></span>
        </motion.div>

        <div className="relative z-10 mt-auto mb-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8"
          >
            Institution Onboarding
          </motion.div>
          <h1 className="text-5xl font-black text-white mb-8 leading-tight">Bring your school <br /> to the next level.</h1>
          
          <div className="space-y-10 max-w-sm">
            <BenefitItem title="Automated Grading" desc="Instant calculation based on custom grading scales." />
            <BenefitItem title="Teacher Portals" desc="Distributed marks entry with final administrative audit." />
            <BenefitItem title="Branded Reports" desc="Professional PDF report cards with your school logo." />
            <BenefitItem title="Data Security" desc="Encrypted multi-tenant architecture for total privacy." />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto relative z-10 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm"
        >
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-indigo-400 fill-indigo-400" />)}
          </div>
          <p className="text-slate-300 text-sm italic mb-4 font-medium">&quot;The transition was seamless. We managed 1200+ students in our first session without a single glitch.&quot;</p>
          <div className="text-xs font-bold text-white uppercase tracking-widest">Global Academy Principal</div>
        </motion.div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-slate-50 relative">
        <div className="absolute top-0 right-0 p-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
                 <GraduationCap className="h-6 w-6 text-indigo-600" />
                 <span className="text-xl font-black text-slate-900 uppercase">EduTrack</span>
            </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-xl"
          >
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-slate-900 mb-2">
                {step === 1 ? 'Tell us about your school' : 'Setup admin credentials'}
              </h2>
              <p className="text-slate-500 font-medium">Complete the registration to unlock your dashboard.</p>
              <div className="flex gap-2 mt-6 justify-center lg:justify-start">
                 <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
                 <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step === 2 ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white">
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

                  <div className="pt-4">
                    <Button type="submit" className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-lg text-white shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                      Continue to Next Step <ArrowRight className="h-5 w-5" />
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

                  <div className="pt-4 flex gap-4">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setStep(1)}
                      className="px-6 rounded-2xl border-slate-200"
                    >
                      <ArrowLeft className="h-5 w-5 font-black text-slate-400" />
                    </Button>
                    <Button type="submit" loading={loading} className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold text-lg text-white shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all">
                      Complete Registration
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

