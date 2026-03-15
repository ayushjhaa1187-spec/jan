'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useCreateStudent } from '@/hooks/useStudents'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  adm_no: z.string().min(2, 'Admission number is required'),
  name: z.string().min(2, 'Student name is required'),
  classId: z.string().min(1, 'Class selection is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ClassItem {
  id: string
  name: string
  section: string
}

export default function NewStudentPage() {
  const router = useRouter()
  const createStudent = useCreateStudent()
  
  const classes = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get('/classes')).data,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      adm_no: '',
      name: '',
      classId: '',
      email: '',
      phone: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await createStudent.mutateAsync(values)
      toast.success('Student registered successfully!')
      router.push('/students')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to register student'
      toast.error(message)
    }
  }

  const classRows: ClassItem[] = classes.data?.data ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Register New Student">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Admission Number"
              placeholder="e.g. ADM-2026-001"
              {...form.register('adm_no')}
              error={form.formState.errors.adm_no?.message}
            />
            <Input
              label="Full Name"
              placeholder="e.g. Rahul Sharma"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Assign to Class
            </label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
              {...form.register('classId')}
            >
              <option value="">Select a class...</option>
              {classRows.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — Section {c.section}
                </option>
              ))}
            </select>
            {form.formState.errors.classId && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {form.formState.errors.classId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email (Optional)"
              type="email"
              placeholder="student@school.edu"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="Phone (Optional)"
              type="tel"
              placeholder="+91 98765 43210"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/students')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createStudent.isPending}
              className="flex-1"
            >
              Register Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
