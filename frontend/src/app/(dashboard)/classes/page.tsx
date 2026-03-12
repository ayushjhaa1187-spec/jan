'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  section: z.string().min(1, 'Section is required'),
  year: z.coerce.number().int().min(2000).max(2100),
})

type FormValues = z.infer<typeof schema>

type ClassRow = { id: string; name: string; section: string; year?: number; _count?: { students: number } }

export default function ClassesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [deleting, setDeleting] = useState<ClassRow | null>(null)

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => (await api.post('/classes', payload)).data,
    onSuccess: async () => {
      toast.success('Class created')
      await queryClient.invalidateQueries({ queryKey: ['classes'] })
      setOpen(false)
      form.reset({ name: '', section: '', year: new Date().getFullYear() })
    },
    onError: () => toast.error('Failed to create class'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) => (await api.put(`/classes/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Class updated')
      await queryClient.invalidateQueries({ queryKey: ['classes'] })
      setEditing(null)
    },
    onError: () => toast.error('Failed to update class'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data,
    onSuccess: async () => {
      toast.success('Class deleted')
      await queryClient.invalidateQueries({ queryKey: ['classes'] })
      setDeleting(null)
    },
    onError: () => toast.error('Failed to delete class'),
  })

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', section: '', year: new Date().getFullYear() } })

  const submitCreate = form.handleSubmit(async (values) => { await createMutation.mutateAsync(values) })
  const submitEdit = form.handleSubmit(async (values) => {
    if (!editing) return
    await updateMutation.mutateAsync({ id: editing.id, payload: values })
  })

  return (
    <Card title='Classes' actions={<Button onClick={() => { setOpen(true); setEditing(null); form.reset({ name: '', section: '', year: new Date().getFullYear() }) }}>Add Class</Button>}>
      <Table
        columns={[
          { key: 'name', label: 'Class' },
          { key: 'section', label: 'Section' },
          { key: 'year', label: 'Year', render: (row) => String((row as ClassRow).year ?? '-') },
          { key: 'students', label: 'Students', render: (row) => String((row as ClassRow)._count?.students ?? 0) },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
              const item = row as ClassRow
              return (
                <div className='flex gap-2'>
                  <Button size='sm' variant='secondary' onClick={() => { setEditing(item); form.reset({ name: item.name, section: item.section, year: item.year ?? new Date().getFullYear() }) }}>Edit</Button>
                  <Button size='sm' variant='danger' onClick={() => setDeleting(item)}>Delete</Button>
                </div>
              )
            },
          },
        ]}
        data={((classes.data as { data?: ClassRow[] })?.data) ?? []}
        loading={classes.isLoading}
        keyExtractor={(row) => (row as ClassRow).id}
      />

      <Modal
        isOpen={open || Boolean(editing)}
        onClose={() => { setOpen(false); setEditing(null) }}
        title={editing ? 'Edit Class' : 'Create Class'}
        footer={<><Button variant='secondary' onClick={() => { setOpen(false); setEditing(null) }}>Cancel</Button><Button onClick={editing ? submitEdit : submitCreate} loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update' : 'Create'}</Button></>}
      >
        <div className='space-y-3'>
          <Input label='Class' {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label='Section' {...form.register('section')} error={form.formState.errors.section?.message} />
          <Input label='Year' type='number' {...form.register('year')} error={form.formState.errors.year?.message} />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title='Delete Class'
        footer={<><Button variant='secondary' onClick={() => setDeleting(null)}>Cancel</Button><Button variant='danger' onClick={async () => { if (deleting) await deleteMutation.mutateAsync(deleting.id) }} loading={deleteMutation.isPending}>Delete</Button></>}
      >
        <p>Delete class <strong>{deleting?.name} - {deleting?.section}</strong>?</p>
      </Modal>
    </Card>
  )
}
