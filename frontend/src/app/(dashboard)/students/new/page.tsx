'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useCreateStudent } from '@/hooks/useStudents'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  classId: z.string().uuid(),
})

type FormValues = z.infer<typeof schema>

export default function NewStudentPage() {
  const router = useRouter()
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const createStudent = useCreateStudent()
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { adm_no: '', name: '', email: '', phone: '', classId: '' } })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createStudent.mutateAsync({ ...values, email: values.email || undefined })
      toast.success('Student created successfully')
      router.push('/students')
    } catch {
      toast.error('Failed to create student')
    }
  })

  return (
    <Card title='Add Student'>
      <form className='space-y-4' onSubmit={onSubmit}>
        <Input label='Admission No' {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} />
        <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
        <Input label='Email' {...form.register('email')} error={form.formState.errors.email?.message} />
        <Input label='Phone' {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>Class</label>
          <select className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
          {form.formState.errors.classId?.message ? <p className='mt-1 text-xs text-red-600'>{form.formState.errors.classId.message}</p> : null}
        </div>
        <div className='flex gap-2'>
          <Button type='submit' loading={createStudent.isPending}>Create Student</Button>
          <Button type='button' variant='secondary' onClick={() => router.push('/students')}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}
