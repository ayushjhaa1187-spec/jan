'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({ name: z.string().min(1), classId: z.string().min(1), startDate: z.string(), endDate: z.string() }).refine((v) => new Date(v.endDate).getTime() > new Date(v.startDate).getTime(), { message: 'End date must be after start date', path: ['endDate'] })
type FormType = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string }

export default function NewExamPage() {
  const router = useRouter()
  const classes = useQuery<{ data: ClassRow[] }>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const form = useForm<FormType>({ resolver: zodResolver(schema) })
  const create = useMutation({ mutationFn: async (payload: FormType) => (await api.post('/exams', payload)).data, onSuccess: (data: { data: { id: string } }) => { toast.success('Exam created'); router.push(`/exams/${data.data.id}`) }, onError: () => toast.error('Create failed') })
  return <Card title="Create Exam"><form className="space-y-3" onSubmit={form.handleSubmit((v) => create.mutate(v))}><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><div><label className="text-sm font-medium">Class</label><select className="mt-1 w-full rounded border px-3 py-2" {...form.register('classId')}><option value="">Select class</option>{(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}</select></div><Input label="Start Date" type="date" {...form.register('startDate')} /><Input label="End Date" type="date" {...form.register('endDate')} error={form.formState.errors.endDate?.message} /><Button type="submit" loading={create.isPending}>Create Exam</Button></form></Card>
}
