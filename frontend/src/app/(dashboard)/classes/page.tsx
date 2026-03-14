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

const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000) })
type FormValues = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string; year: number }

export default function ClassesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const queryClient = useQueryClient()
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: ClassRow[] }>('/classes')).data })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({ mutationFn: async (payload: FormValues) => (await api.post('/classes', payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['classes'] }) } })
  const updateMutation = useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) => (await api.put(`/classes/${id}`, payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['classes'] }) } })
  const deleteMutation = useMutation({ mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['classes'] }) } })

  const cols: Column<ClassRow>[] = [
    { key: 'name', label: 'Name' },
    { key: 'section', label: 'Section' },
    { key: 'year', label: 'Year' },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { setEditing(row); setOpen(true); reset(row) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => void deleteMutation.mutateAsync(row.id)}>Delete</Button></div> }
  ]

  return <Card title="Classes" actions={<Button onClick={() => { setEditing(null); reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true) }}>Add Class</Button>}><Table columns={cols} data={classes.data?.data ?? []} keyExtractor={(r) => r.id} loading={classes.isLoading} /><Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Class' : 'Add Class'} footer={<Button onClick={handleSubmit(async (v) => { if (editing) await updateMutation.mutateAsync({ id: editing.id, payload: v }); else await createMutation.mutateAsync(v); setOpen(false) })}>Save</Button>}><div className="space-y-3"><Input label="Name" {...register('name')} error={errors.name?.message} /><Input label="Section" {...register('section')} error={errors.section?.message} /><Input label="Year" type="number" {...register('year')} error={errors.year?.message} /></div></Modal></Card>
}
