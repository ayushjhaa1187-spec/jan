'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000).max(2100) })
type FormValues = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string; year: number }

export default function ClassesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [deleting, setDeleting] = useState<ClassRow | null>(null)
  const [open, setOpen] = useState(false)

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const createMutation = useMutation({ mutationFn: async (payload: FormValues) => (await api.post('/classes', payload)).data, onSuccess: async () => { toast.success('Class created'); await qc.invalidateQueries({ queryKey: ['classes'] }); setOpen(false) } })
  const updateMutation = useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) => (await api.put(`/classes/${id}`, payload)).data, onSuccess: async () => { toast.success('Class updated'); await qc.invalidateQueries({ queryKey: ['classes'] }); setEditing(null) } })
  const deleteMutation = useMutation({ mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data, onSuccess: async () => { toast.success('Class deleted'); await qc.invalidateQueries({ queryKey: ['classes'] }); setDeleting(null) } })

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', section: '', year: new Date().getFullYear() } })

  return (
    <Card title="Classes" actions={<Button onClick={() => { form.reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true) }}>Add Class</Button>}>
      <Table columns={[{ key: 'name', label: 'Name' }, { key: 'section', label: 'Section' }, { key: 'year', label: 'Year' }, { key: 'actions', label: 'Actions', render: (r) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { const item = r as ClassRow; setEditing(item); form.reset({ name: item.name, section: item.section, year: item.year }) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(r as ClassRow)}>Delete</Button></div> }]} data={classes.data?.data ?? []} loading={classes.isLoading} keyExtractor={(r) => (r as ClassRow).id} />
      <Modal isOpen={open || Boolean(editing)} onClose={() => { setOpen(false); setEditing(null) }} title={editing ? 'Edit Class' : 'Create Class'} footer={<><Button variant="secondary" onClick={() => { setOpen(false); setEditing(null) }}>Cancel</Button><Button loading={createMutation.isPending || updateMutation.isPending} onClick={form.handleSubmit(async (values) => { if (editing) await updateMutation.mutateAsync({ id: editing.id, payload: values }); else await createMutation.mutateAsync(values) })}>{editing ? 'Update' : 'Create'}</Button></>}>
        <div className="space-y-3"><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><Input label="Section" {...form.register('section')} error={form.formState.errors.section?.message} /><Input type="number" label="Year" {...form.register('year')} error={form.formState.errors.year?.message} /></div>
      </Modal>
      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete class" footer={<><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={deleteMutation.isPending} onClick={async () => deleting && deleteMutation.mutateAsync(deleting.id)}>Delete</Button></>}>
        <p>Delete <strong>{deleting?.name}</strong>?</p>
      </Modal>
    </Card>
  )
}
