'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useCreateExam } from '@/hooks/useExams'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({ name: z.string().min(2), classId: z.string().min(1), startDate: z.string().min(1), endDate: z.string().min(1) }).refine((v) => new Date(v.endDate) > new Date(v.startDate), { message: 'End date must be after start date', path: ['endDate'] })
type Values = z.infer<typeof schema>

export default function NewExamPage() {
  const router = useRouter()
  const createExam = useCreateExam()
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', classId: '', startDate: '', endDate: '' } })

  return <Card title="Create Exam"><form className="space-y-3" onSubmit={form.handleSubmit(async (values) => {
    try {
      const res = await createExam.mutateAsync(values)
      toast.success('Exam created')
      router.push(`/exams/${res.data.id}`)
    } catch { toast.error('Failed to create exam') }
  })}><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><label className="block text-sm">Class<select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" {...form.register('classId')}><option value="">Select class</option>{(classes.data?.data ?? []).map((c: { id: string; name: string; section: string }) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}</select></label><Input label="Start Date" type="date" {...form.register('startDate')} error={form.formState.errors.startDate?.message} /><Input label="End Date" type="date" {...form.register('endDate')} error={form.formState.errors.endDate?.message} /><Button loading={createExam.isPending}>Create Exam</Button></form></Card>
}
