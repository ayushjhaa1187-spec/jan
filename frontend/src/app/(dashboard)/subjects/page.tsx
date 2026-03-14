'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

interface SubjectRow { id: string; name: string; code: string; maxMarks: number }
interface SubjectResponse { data: SubjectRow[] }
const schema = z.object({ name: z.string().min(1), code: z.string().min(1), maxMarks: z.coerce.number().min(1) })
type FormData = z.infer<typeof schema>

export default function SubjectsPage() {
  const [editing, setEditing] = useState<SubjectRow | null>(null)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const subjects = useQuery<SubjectResponse>({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data })
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', code: '', maxMarks: 100 } })
  const save = useMutation({ mutationFn: async (values: FormData & { id?: string }) => values.id ? (await api.put(`/subjects/${values.id}`, values)).data : (await api.post('/subjects', values)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Saved'); setOpen(false); setEditing(null) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/subjects/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['subjects'] }); toast.success('Deleted') } })

  return <Card title='Subjects' actions={<Button onClick={() => { setEditing(null); form.reset({ name: '', code: '', maxMarks: 100 }); setOpen(true) }}>Add Subject</Button>}>
    <Table columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'maxMarks', label: 'Max Marks' }, { key: 'actions', label: 'Actions', render: (row: SubjectRow) => <div className='flex gap-2'><Button size='sm' variant='ghost' onClick={() => { setEditing(row); form.reset(row); setOpen(true) }}>Edit</Button><Button size='sm' variant='danger' onClick={() => void remove.mutateAsync(row.id)}>Delete</Button></div> }]} data={subjects.data?.data ?? []} loading={subjects.isLoading} keyExtractor={(row) => row.id} />
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Subject' : 'Create Subject'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button loading={save.isPending} onClick={form.handleSubmit((values) => void save.mutateAsync({ ...values, id: editing?.id }))}>Save</Button></>}>
      <div className='space-y-3'><Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} /><Input label='Code' {...form.register('code')} error={form.formState.errors.code?.message} /><Input label='Max Marks' type='number' {...form.register('maxMarks')} error={form.formState.errors.maxMarks?.message} /></div>
    </Modal>
  </Card>
}
