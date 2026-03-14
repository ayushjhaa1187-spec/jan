'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2),
  classId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
}).refine((val) => new Date(val.endDate).getTime() > new Date(val.startDate).getTime(), { path: ['endDate'], message: 'End date must be after start date' })

type FormValues = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string }

export default function NewExamPage() {
  const router = useRouter()
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: ClassRow[] }>('/classes')).data })
  const mutation = useMutation({ mutationFn: async (payload: FormValues) => (await api.post<{ data: { id: string } }>('/exams', payload)).data })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await mutation.mutateAsync(values)
      router.push(`/exams/${response.data.id}`)
    } catch {
      toast.error('Failed to create exam')
    }
  }

  return (
    <Card title="Create Exam">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <div>
          <label className="mb-1 block text-sm font-medium">Class</label>
          <select className="w-full rounded-lg border px-3 py-2" {...register('classId')}>
            <option value="">Select class</option>
            {(classes.data?.data ?? []).map((cls) => <option key={cls.id} value={cls.id}>{cls.name} - {cls.section}</option>)}
          </select>
        </div>
        <Input label="Start Date" type="date" {...register('startDate')} error={errors.startDate?.message} />
        <Input label="End Date" type="date" {...register('endDate')} error={errors.endDate?.message} />
        <Button type="submit" loading={isSubmitting}>Create</Button>
      </form>
    </Card>
  )
}
