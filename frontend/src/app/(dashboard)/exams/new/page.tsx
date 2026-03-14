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
  startDate: z.string().min(1),
  endDate: z.string().min(1),
}).refine((values) => new Date(values.endDate).getTime() > new Date(values.startDate).getTime(), {
  path: ['endDate'],
  message: 'End date must be after start date',
})

type FormData = z.infer<typeof schema>
interface ClassesResponse { data: Array<{ id: string; name: string; section: string }> }
interface ExamCreateResponse { data: { id: string } }

export default function NewExamPage() {
  const router = useRouter()
  const classes = useQuery<ClassesResponse>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', classId: '', startDate: '', endDate: '' } })

  const mutation = useMutation({
    mutationFn: async (values: FormData) => (await api.post<ExamCreateResponse>('/exams', values)).data,
    onSuccess: (response) => {
      toast.success('Exam created')
      router.push(`/exams/${response.data.id}`)
    },
    onError: () => toast.error('Failed to create exam')
  })

  return (
    <Card title='Create Exam'>
      <form className='space-y-3' onSubmit={form.handleSubmit((values) => void mutation.mutateAsync(values))}>
        <Input label='Exam Name' {...form.register('name')} error={form.formState.errors.name?.message} />
        <div><label className='mb-1 block text-sm font-medium'>Class</label><select className='w-full rounded-lg border px-3 py-2' {...form.register('classId')}><option value=''>Select class</option>{(classes.data?.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name} - {row.section}</option>)}</select></div>
        <Input label='Start Date' type='date' {...form.register('startDate')} error={form.formState.errors.startDate?.message} />
        <Input label='End Date' type='date' {...form.register('endDate')} error={form.formState.errors.endDate?.message} />
        <Button type='submit' loading={mutation.isPending}>Create</Button>
      </form>
    </Card>
  )
}
