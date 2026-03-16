'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Building, User, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react'
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

export default function RegisterSchool() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  
  // Store part 1 data
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
      
      toast.success('School registered successfully! You can now log in.')
      router.push('/login?registered=true')
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to register school. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <div className="bg-indigo-600 p-3 rounded-xl mb-4 shadow-sm">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            {step === 1 ? 'Register Your School' : 'Create Admin Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {step === 1 ? 'Step 1 of 2: Organization Details' : 'Step 2 of 2: Admin Credentials'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100">
          
          {step === 1 ? (
            <form onSubmit={schoolForm.handleSubmit(onSchoolSubmit)} className="space-y-5">
              <Input
                label="School Name"
                placeholder="Delhi Public School"
                error={schoolForm.formState.errors.schoolName?.message}
                {...schoolForm.register('schoolName')}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Board"
                  placeholder="CBSE, ICSE, etc."
                  error={schoolForm.formState.errors.board?.message}
                  {...schoolForm.register('board')}
                />
                <Input
                  label="School Code"
                  placeholder="DPSDELHI"
                  error={schoolForm.formState.errors.schoolCode?.message}
                  {...schoolForm.register('schoolCode')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="New Delhi"
                  error={schoolForm.formState.errors.city?.message}
                  {...schoolForm.register('city')}
                />
                <Input
                  label="State"
                  placeholder="Delhi"
                  error={schoolForm.formState.errors.state?.message}
                  {...schoolForm.register('state')}
                />
              </div>

              <Input
                label="Phone Number"
                placeholder="+91 XXXXX XXXXX"
                error={schoolForm.formState.errors.phone?.message}
                {...schoolForm.register('phone')}
              />

              <div className="pt-2">
                <Button type="submit" className="w-full flex items-center justify-center gap-2">
                  Next Step <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-5">
              <Input
                label="Admin Full Name"
                placeholder="Raj Kumar"
                error={adminForm.formState.errors.adminName?.message}
                {...adminForm.register('adminName')}
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@school.com"
                error={adminForm.formState.errors.email?.message}
                {...adminForm.register('email')}
              />

              <Input
                label="Personal Phone"
                placeholder="+91 XXXXX XXXXX"
                error={adminForm.formState.errors.adminPhone?.message}
                {...adminForm.register('adminPhone')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={adminForm.formState.errors.password?.message}
                {...adminForm.register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={adminForm.formState.errors.confirmPassword?.message}
                {...adminForm.register('confirmPassword')}
              />

              <div className="pt-2 flex gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setStep(1)}
                  className="px-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button type="submit" loading={loading} className="w-full">
                  Create School Account
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an organization?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
