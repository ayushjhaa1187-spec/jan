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
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  maxMarks: z.coerce.number().min(1).max(500),
})

type FormValues = z.infer<typeof schema>
type SubjectRow = { id: string; name: string; code: string; maxMarks?: number }

export default function SubjectsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectRow | null>(null)
  const [deleting, setDeleting] = useState<SubjectRow | null>(null)

  const subjects = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data })

  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => (await api.post('/subjects', payload)).data,
    onSuccess: async () => {
      toast.success('Subject created')
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setOpen(false)
      form.reset({ name: '', code: '', maxMarks: 100 })
    },
    onError: () => toast.error('Failed to create subject'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) => (await api.put(`/subjects/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Subject updated')
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setEditing(null)
    },
    onError: () => toast.error('Failed to update subject'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/subjects/${id}`)).data,
    onSuccess: async () => {
      toast.success('Subject deleted')
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setDeleting(null)
    },
    onError: () => toast.error('Failed to delete subject'),
  })

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', code: '', maxMarks: 100 } })

  return (
    <Card title='Subjects' actions={<Button onClick={() => { setOpen(true); setEditing(null); form.reset({ name: '', code: '', maxMarks: 100 }) }}>Add Subject</Button>}>
      <Table
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
          { key: 'maxMarks', label: 'Max Marks', render: (row) => String((row as SubjectRow).maxMarks ?? 100) },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
              const item = row as SubjectRow
              return (
                <div className='flex gap-2'>
                  <Button size='sm' variant='secondary' onClick={() => { setEditing(item); form.reset({ name: item.name, code: item.code, maxMarks: item.maxMarks ?? 100 }) }}>Edit</Button>
                  <Button size='sm' variant='danger' onClick={() => setDeleting(item)}>Delete</Button>
                </div>
              )
            },
          },
        ]}
        data={((subjects.data as { data?: SubjectRow[] })?.data) ?? []}
        loading={subjects.isLoading}
        keyExtractor={(row) => (row as SubjectRow).id}
      />

      <Modal
        isOpen={open || Boolean(editing)}
        onClose={() => { setOpen(false); setEditing(null) }}
        title={editing ? 'Edit Subject' : 'Create Subject'}
        footer={<><Button variant='secondary' onClick={() => { setOpen(false); setEditing(null) }}>Cancel</Button><Button onClick={form.handleSubmit(async (values) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, payload: values })
          } else {
            await createMutation.mutateAsync(values)
          }
        })} loading={createMutation.isPending || updateMutation.isPending}>{editing ? 'Update' : 'Create'}</Button></>}
      >
        <div className='space-y-3'>
          <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label='Code' {...form.register('code')} error={form.formState.errors.code?.message} />
          <Input label='Max Marks' type='number' {...form.register('maxMarks')} error={form.formState.errors.maxMarks?.message} />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title='Delete Subject'
        footer={<><Button variant='secondary' onClick={() => setDeleting(null)}>Cancel</Button><Button variant='danger' onClick={async () => { if (deleting) await deleteMutation.mutateAsync(deleting.id) }} loading={deleteMutation.isPending}>Delete</Button></>}
      >
        <p>Delete subject <strong>{deleting?.name}</strong>?</p>
      </Modal>
    </Card>
  )
}
