'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useCreateStudent, useDeleteStudent, useStudents, useUpdateStudent } from '@/hooks/useStudents'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  classId: z.string().uuid(),
})

type FormValues = z.infer<typeof schema>

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [editItem, setEditItem] = useState<{ id: string; adm_no?: string; name?: string; classId?: string } | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null)

  const students = useStudents({ page, limit: 20, search, classId: classId || undefined })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent()
  const deleteMutation = useDeleteStudent()

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { adm_no: '', name: '', email: '', phone: '', classId: '' } })

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync({ ...values, email: values.email || undefined })
      toast.success('Student created successfully')
      setOpenCreate(false)
      form.reset()
    } catch {
      toast.error('Failed to create student')
    }
  })

  const onUpdate = form.handleSubmit(async (values) => {
    if (!editItem) return
    try {
      await updateMutation.mutateAsync({ id: editItem.id, payload: values })
      toast.success('Student updated successfully')
      setEditItem(null)
      form.reset()
    } catch {
      toast.error('Failed to update student')
    }
  })

  const onDelete = async () => {
    if (!deleteItem) return
    try {
      await deleteMutation.mutateAsync(deleteItem.id)
      toast.success('Student deleted')
      setDeleteItem(null)
    } catch {
      toast.error('Delete failed')
    }
  }

  return (
    <div className='space-y-4'>
      <Card title='Students' actions={<Button onClick={() => setOpenCreate(true)}>Add Student</Button>}>
        <div className='mb-4 grid gap-3 md:grid-cols-3'>
          <Input placeholder='Search students...' value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <select className='rounded border px-3 py-2' value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value=''>All Classes</option>
            {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
        </div>

        <Table
          loading={students.isLoading}
          columns={[
            { key: 'enrollmentNo', label: 'Adm No' },
            { key: 'name', label: 'Name', render: (row) => `${(row as { firstName: string }).firstName} ${(row as { lastName: string }).lastName}` },
            { key: 'class', label: 'Class - Section', render: (row) => `${(row as { class: { name: string; section: string } }).class?.name} - ${(row as { class: { name: string; section: string } }).class?.section}` },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => {
                const item = row as { id: string; enrollmentNo: string; firstName: string; lastName: string; classId: string }
                return (
                  <div className='flex gap-2'>
                    <Button size='sm' variant='secondary' onClick={() => {
                      setEditItem({ id: item.id, adm_no: item.enrollmentNo, name: `${item.firstName} ${item.lastName}`, classId: item.classId })
                      form.reset({ adm_no: item.enrollmentNo, name: `${item.firstName} ${item.lastName}`, classId: item.classId, email: '', phone: '' })
                    }}>Edit</Button>
                    <Button size='sm' variant='danger' onClick={() => setDeleteItem({ id: item.id, name: `${item.firstName} ${item.lastName}` })}>Delete</Button>
                  </div>
                )
              },
            },
          ]}
          data={students.data?.data?.data ?? []}
        />

        <div className='mt-4'>
          <Pagination page={page} totalPages={students.data?.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title='Create Student' footer={<><Button variant='secondary' onClick={() => setOpenCreate(false)}>Cancel</Button><Button onClick={onCreate} loading={createMutation.isPending}>Create</Button></>}>
        <div className='space-y-3'>
          <Input label='Admission No' {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} />
          <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label='Email' {...form.register('email')} error={form.formState.errors.email?.message} />
          <Input label='Phone' {...form.register('phone')} error={form.formState.errors.phone?.message} />
          <select className='w-full rounded border px-3 py-2' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal open={Boolean(editItem)} onClose={() => setEditItem(null)} title='Edit Student' footer={<><Button variant='secondary' onClick={() => setEditItem(null)}>Cancel</Button><Button onClick={onUpdate} loading={updateMutation.isPending}>Update</Button></>}>
        <div className='space-y-3'>
          <Input label='Admission No' {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} />
          <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
          <select className='w-full rounded border px-3 py-2' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)} title='Delete Student' footer={<><Button variant='secondary' onClick={() => setDeleteItem(null)}>Cancel</Button><Button variant='danger' onClick={onDelete} loading={deleteMutation.isPending}>Delete</Button></>}>
        <p>Are you sure you want to delete <strong>{deleteItem?.name}</strong>?</p>
      </Modal>
    </div>
  )
}
