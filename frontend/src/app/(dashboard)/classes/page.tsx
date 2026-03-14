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

interface ClassRow { id: string; name: string; section: string; year: number }
interface ClassResponse { data: ClassRow[] }
const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000) })
type FormData = z.infer<typeof schema>

export default function ClassesPage() {
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const classes = useQuery<ClassResponse>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: '', section: '', year: new Date().getFullYear() } })

  const save = useMutation({ mutationFn: async (values: FormData & { id?: string }) => values.id ? (await api.put(`/classes/${values.id}`, values)).data : (await api.post('/classes', values)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Saved'); setOpen(false); setEditing(null) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Deleted') } })

  return <Card title="Classes" actions={<Button onClick={() => { setEditing(null); form.reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true) }}>Add Class</Button>}>
    <Table columns={[{ key: 'name', label: 'Name' }, { key: 'section', label: 'Section' }, { key: 'year', label: 'Year' }, { key: 'actions', label: 'Actions', render: (row: ClassRow) => <div className='flex gap-2'><Button size='sm' variant='ghost' onClick={() => { setEditing(row); form.reset(row); setOpen(true) }}>Edit</Button><Button size='sm' variant='danger' onClick={() => void remove.mutateAsync(row.id)}>Delete</Button></div> }]} data={classes.data?.data ?? []} loading={classes.isLoading} keyExtractor={(row) => row.id} />
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Class' : 'Create Class'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button loading={save.isPending} onClick={form.handleSubmit((values) => void save.mutateAsync({ ...values, id: editing?.id }))}>Save</Button></>}>
      <div className='space-y-3'><Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} /><Input label='Section' {...form.register('section')} error={form.formState.errors.section?.message} /><Input label='Year' type='number' {...form.register('year')} error={form.formState.errors.year?.message} /></div>
    </Modal>
  </Card>
}
