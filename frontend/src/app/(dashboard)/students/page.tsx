'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { Table, Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'

const studentSchema = z.object({ adm_no: z.string().min(2), name: z.string().min(2), classId: z.string().min(1), email: z.string().email().optional().or(z.literal('')), phone: z.string().optional() })
type StudentForm = z.infer<typeof studentSchema>
interface StudentRow { id: string; adm_no: string; name: string; classId: string; class?: { id: string; name: string; section: string } }
interface ClassRow { id: string; name: string; section: string }
interface ListResponse { data: StudentRow[]; meta: { totalPages: number } }

export default function StudentsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [classId, setClassId] = useState('')
  const [editing, setEditing] = useState<StudentRow | null>(null)
  const [deleting, setDeleting] = useState<StudentRow | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const students = useQuery({ queryKey: ['students', page, debounced, classId], queryFn: async () => (await api.get<ListResponse>('/students', { params: { page, limit: 10, search: debounced || undefined, classId: classId || undefined } })).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: ClassRow[] }>('/classes')).data })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentForm>({ resolver: zodResolver(studentSchema), defaultValues: { adm_no: '', name: '', classId: '' } })

  const createMutation = useMutation({ mutationFn: async (payload: StudentForm) => (await api.post('/students', payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student created') } })
  const updateMutation = useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: StudentForm }) => (await api.put(`/students/${id}`, payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student updated') } })
  const deleteMutation = useMutation({ mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['students'] }); toast.success('Student deleted') } })

  const columns = useMemo<Column<StudentRow>[]>(() => [
    { key: 'adm_no', label: 'Adm No' },
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class', render: (row) => row.class ? `${row.class.name} - ${row.class.section}` : '-' },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => { setEditing(row); reset({ adm_no: row.adm_no, name: row.name, classId: row.classId, email: '', phone: '' }); setOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleting(row)}>Delete</Button></div> }
  ], [reset])

  const onSubmit = async (values: StudentForm) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload: values })
    } else {
      await createMutation.mutateAsync(values)
    }
    setOpen(false)
    setEditing(null)
    reset({ adm_no: '', name: '', classId: '' })
  }

  return (
    <Card title="Students" actions={<Button onClick={() => { setEditing(null); reset({ adm_no: '', name: '', classId: '' }); setOpen(true) }}>Add Student</Button>}>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input placeholder="Search by name / adm no" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="rounded-lg border px-3 py-2" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All Classes</option>
          {(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
        </select>
      </div>
      <Table columns={columns} data={students.data?.data ?? []} loading={students.isLoading} keyExtractor={(row) => row.id} />
      <div className="mt-4"><Pagination page={page} totalPages={students.data?.meta.totalPages ?? 1} onPageChange={setPage} /></div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>{editing ? 'Update' : 'Create'}</Button></div>}>
        <div className="space-y-3">
          <Input label="Admission No" {...register('adm_no')} error={errors.adm_no?.message} />
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <select className="w-full rounded-lg border px-3 py-2" {...register('classId')}>
            <option value="">Select class</option>
            {(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
          </select>
          {errors.classId ? <p className="text-xs text-red-600">{errors.classId.message}</p> : null}
          <Input label="Email" {...register('email')} />
          <Input label="Phone" {...register('phone')} />
        </div>
      </Modal>

      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete Student" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" onClick={() => deleting ? void deleteMutation.mutateAsync(deleting.id).then(() => setDeleting(null)) : undefined}>Delete</Button></div>}>
        <p>Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
      </Modal>
    </Card>
  )
}
