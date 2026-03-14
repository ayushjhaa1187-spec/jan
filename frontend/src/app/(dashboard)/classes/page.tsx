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

const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000) })
type ClassForm = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string; year: number }

export default function ClassesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const classes = useQuery<{ data: ClassRow[] }>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const form = useForm<ClassForm>({ resolver: zodResolver(schema), defaultValues: { name: '', section: '', year: new Date().getFullYear() } })
  const save = useMutation({ mutationFn: async (payload: ClassForm & { id?: string }) => payload.id ? (await api.put(`/classes/${payload.id}`, payload)).data : (await api.post('/classes', payload)).data, onSuccess: async () => { toast.success('Saved'); setOpen(false); await qc.invalidateQueries({ queryKey: ['classes'] }) }, onError: () => toast.error('Save failed') })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data, onSuccess: async () => { toast.success('Deleted'); setDeleteId(null); await qc.invalidateQueries({ queryKey: ['classes'] }) } })
  const cols: Column<ClassRow>[] = [{ key: 'name', label: 'Name' }, { key: 'section', label: 'Section' }, { key: 'year', label: 'Year' }, { key: 'actions', label: 'Actions', render: (r) => <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(r); form.reset({ name: r.name, section: r.section, year: r.year }); setOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleteId(r.id)}>Delete</Button></div> }]
  return <Card title="Classes" actions={<Button onClick={() => { setEditing(null); form.reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true) }}>Add Class</Button>}><Table columns={cols} data={classes.data?.data ?? []} keyExtractor={(r) => r.id} loading={classes.isLoading} />
    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Class' : 'Add Class'} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={form.handleSubmit((v) => save.mutate({ ...v, id: editing?.id }))} loading={save.isPending}>Save</Button></>}><div className="space-y-2"><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><Input label="Section" {...form.register('section')} error={form.formState.errors.section?.message} /><Input label="Year" type="number" {...form.register('year')} error={form.formState.errors.year?.message} /></div></Modal>
    <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete class" footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteId && remove.mutate(deleteId)}>Delete</Button></>}><p>Delete this class?</p></Modal>
  </Card>
}
