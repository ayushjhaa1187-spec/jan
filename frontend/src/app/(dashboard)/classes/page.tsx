'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

export default function ClassesPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', section: '', year: String(new Date().getFullYear()) })

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  const createClass = useMutation({
    mutationFn: async () => (await api.post('/classes', { name: form.name, section: form.section, year: Number(form.year) })).data,
    onSuccess: async () => {
      toast.success('Class created')
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
    onError: () => toast.error('Failed to create class'),
  })

  return (
    <Card title='Classes' actions={<Button onClick={() => setOpen(true)}>Add Class</Button>}>
      <Table
        columns={[
          { key: 'name', label: 'Class' },
          { key: 'section', label: 'Section' },
          { key: 'year', label: 'Year', render: () => '-' },
          { key: '_count', label: 'Students Count', render: (row) => String((row as { _count?: { students: number } })._count?.students ?? 0) },
        ]}
        data={classes.data?.data ?? []}
        loading={classes.isLoading}
      />

      <Modal open={open} onClose={() => setOpen(false)} title='Create Class' footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button loading={createClass.isPending} onClick={() => createClass.mutate()}>Create</Button></>}>
        <div className='space-y-3'>
          <Input label='Name' value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <Input label='Section' value={form.section} onChange={(event) => setForm((prev) => ({ ...prev, section: event.target.value }))} />
          <Input label='Year' value={form.year} onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))} />
        </div>
      </Modal>
    </Card>
  )
}
