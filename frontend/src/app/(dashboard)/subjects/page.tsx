'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Table, Column } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'

const schema = z.object({ name: z.string().min(1), code: z.string().min(1), maxMarks: z.coerce.number().min(1) })
type SubjectForm = z.infer<typeof schema>
interface SubjectRow { id: string; name: string; code: string; maxMarks: number }

export default function SubjectsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectRow | null>(null)
  const subjects = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get<{ data: SubjectRow[] }>('/subjects')).data })
  const createMutation = useMutation({ mutationFn: async (payload: SubjectForm) => (await api.post('/subjects', payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['subjects'] }) } })
  const updateMutation = useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: SubjectForm }) => (await api.put(`/subjects/${id}`, payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['subjects'] }) } })
  const deleteMutation = useMutation({ mutationFn: async (id: string) => (await api.delete(`/subjects/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['subjects'] }) } })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectForm>({ resolver: zodResolver(schema) })

  const columns: Column<SubjectRow>[] = [
    { key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'maxMarks', label: 'Max Marks' },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { setEditing(row); reset(row); setOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => void deleteMutation.mutateAsync(row.id)}>Delete</Button></div> }
  ]

  return <Card title="Subjects" actions={<Button onClick={() => { setEditing(null); reset({ name: '', code: '', maxMarks: 100 }); setOpen(true) }}>Add Subject</Button>}><Table columns={columns} data={subjects.data?.data ?? []} loading={subjects.isLoading} keyExtractor={(row) => row.id} /><Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} footer={<Button onClick={handleSubmit(async (values) => { if (editing) await updateMutation.mutateAsync({ id: editing.id, payload: values }); else await createMutation.mutateAsync(values); setOpen(false) })}>Save</Button>}><div className="space-y-3"><Input label="Name" {...register('name')} error={errors.name?.message} /><Input label="Code" {...register('code')} error={errors.code?.message} /><Input label="Max Marks" type="number" {...register('maxMarks')} error={errors.maxMarks?.message} /></div></Modal></Card>
}
