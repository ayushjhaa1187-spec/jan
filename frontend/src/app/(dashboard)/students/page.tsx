'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Table, Column } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'

interface StudentRow { id: string; adm_no: string; name: string; classId: string; class?: { name: string; section: string } }
interface ClassRow { id: string; name: string; section: string }
interface StudentsResponse { data: { data: StudentRow[]; meta: { page: number; totalPages: number } } }
interface ClassesResponse { data: ClassRow[] }

const studentSchema = z.object({
  adm_no: z.string().min(2),
  name: z.string().min(2),
  classId: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
})

type StudentForm = z.infer<typeof studentSchema>

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [classId, setClassId] = useState('')
  const [editing, setEditing] = useState<StudentRow | null>(null)
  const [deleting, setDeleting] = useState<StudentRow | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => { const id = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(id) }, [search])

  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ['students', page, debounced, classId],
    queryFn: async () => (await api.get('/students', { params: { page, limit: 10, search: debounced, classId: classId || undefined } })).data,
  })

  const classes = useQuery<ClassesResponse>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  const saveMutation = useMutation({
    mutationFn: async (payload: StudentForm & { id?: string }) => payload.id ? (await api.put(`/students/${payload.id}`, payload)).data : (await api.post('/students', payload)).data,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student saved'); setIsModalOpen(false); setEditing(null) }
  })
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deleted'); setDeleting(null) }
  })

  const form = useForm<StudentForm>({ resolver: zodResolver(studentSchema), defaultValues: { adm_no: '', name: '', classId: '', email: '', phone: '' } })
  useEffect(() => {
    if (editing) form.reset({ adm_no: editing.adm_no, name: editing.name, classId: editing.classId, email: '', phone: '' })
    else form.reset({ adm_no: '', name: '', classId: '', email: '', phone: '' })
  }, [editing, form])

  const columns = useMemo<Column<StudentRow>[]>(() => [
    { key: 'adm_no', label: 'Adm No' },
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class', render: (row) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}`.trim() },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(row); setIsModalOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(row)}>Delete</Button></div> },
  ], [])

  return (
    <Card title="Students" actions={<Button onClick={() => { setEditing(null); setIsModalOpen(true) }}>Add Student</Button>}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input placeholder="Search students" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="rounded-lg border border-gray-300 px-3 py-2" value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value="">All Classes</option>
          {(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
        </select>
      </div>

      <Table columns={columns} data={data?.data.data ?? []} loading={isLoading} keyExtractor={(row) => row.id} />
      <div className="mt-4"><Pagination page={data?.data.meta.page ?? 1} totalPages={data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button loading={saveMutation.isPending} onClick={form.handleSubmit((values) => void saveMutation.mutateAsync({ ...values, id: editing?.id }))}>Save</Button></>}>
        <form className="space-y-3">
          <Input label="Admission No" {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} />
          <Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} />
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2" {...form.register('classId')}>
            <option value="">Select class</option>
            {(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
          </select>
          <Input label="Email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <Input label="Phone" {...form.register('phone')} />
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete Student" footer={<><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleting && void deleteMutation.mutateAsync(deleting.id)}>Delete</Button></>}>
        Are you sure you want to delete <strong>{deleting?.name}</strong>?
      </Modal>
    </Card>
  )
}
