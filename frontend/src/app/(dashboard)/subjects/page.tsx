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

export default function SubjectsPage() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const subjects = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data })
  const createSubject = useMutation({
    mutationFn: async () => (await api.post('/subjects', { name, code })).data,
    onSuccess: async () => {
      toast.success('Subject created')
      setOpen(false)
      setName('')
      setCode('')
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
    onError: () => toast.error('Failed to create subject'),
  })

  return (
    <Card title='Subjects' actions={<Button onClick={() => setOpen(true)}>Add Subject</Button>}>
      <Table
        columns={[{ key: 'name', label: 'Name' }, { key: 'code', label: 'Code' }, { key: 'maxMarks', label: 'Max Marks', render: () => '100' }]}
        data={subjects.data?.data ?? []}
        loading={subjects.isLoading}
      />

      <Modal open={open} onClose={() => setOpen(false)} title='Create Subject' footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createSubject.mutate()} loading={createSubject.isPending}>Create</Button></>}>
        <div className='space-y-3'>
          <Input label='Name' value={name} onChange={(event) => setName(event.target.value)} />
          <Input label='Code' value={code} onChange={(event) => setCode(event.target.value)} />
        </div>
      </Modal>
    </Card>
  )
}
