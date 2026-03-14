'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Table, Column } from '@/components/ui/Table'

const schema = z.object({ name: z.string().min(1), code: z.string().min(1), maxMarks: z.coerce.number().min(1) })
type SubjectForm = z.infer<typeof schema>
interface SubjectRow { id: string; name: string; code: string; maxMarks: number }

export default function SubjectsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const subjects = useQuery<{ data: SubjectRow[] }>({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data })
  const form = useForm<SubjectForm>({ resolver: zodResolver(schema), defaultValues: { name: '', code: '', maxMarks: 100 } })
  const save = useMutation({ mutationFn: async (payload: SubjectForm & { id?: string }) => payload.id ? (await api.put(`/subjects/${payload.id}`, payload)).data : (await api.post('/subjects', payload)).data, onSuccess: async () => { toast.success('Saved'); setOpen(false); await qc.invalidateQueries({ queryKey: ['subjects'] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/subjects/${id}`)).data, onSuccess: async () => { toast.success('Deleted'); setDeleteId(null); await qc.invalidateQueries({ queryKey: ['subjects'] }) } })
  const cols: Column<SubjectRow>[] = [{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'maxMarks', label: 'Max Marks' }, { key: 'actions', label: 'Actions', render: (r) => <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(r); form.reset({ name: r.name, code: r.code, maxMarks: r.maxMarks }); setOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)}>Delete</Button></div> }]
  return <Card title="Subjects" actions={<Button onClick={() => { setEditing(null); form.reset({ name: '', code: '', maxMarks: 100 }); setOpen(true) }}>Add Subject</Button>}><Table columns={cols} data={subjects.data?.data ?? []} keyExtractor={(r) => r.id} loading={subjects.isLoading} />
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => save.mutate({ ...v, id: editing?.id }))}>Save</Button></>}><div className="space-y-2"><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><Input label="Code" {...form.register('code')} error={form.formState.errors.code?.message} /><Input label="Max Marks" type="number" {...form.register('maxMarks')} error={form.formState.errors.maxMarks?.message} /></div></Modal>
    <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete subject" footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteId && remove.mutate(deleteId)}>Delete</Button></>}><p>Delete this subject?</p></Modal>
  </Card>
}
