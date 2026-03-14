'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const studentSchema = z.object({ adm_no: z.string().min(1), name: z.string().min(2), classId: z.string().min(1), email: z.string().email().optional().or(z.literal('')), phone: z.string().optional() })
type StudentForm = z.infer<typeof studentSchema>
interface StudentRow { id: string; adm_no: string; name: string; email?: string; phone?: string; class?: { id: string; name: string; section: string } }
interface ClassRow { id: string; name: string; section: string }
interface ListRes { data: StudentRow[]; meta: { page: number; totalPages: number } }

export default function StudentsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [classId, setClassId] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<StudentRow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const students = useQuery<{ data: ListRes }>({ queryKey: ['students', page, debounced, classId], queryFn: async () => (await api.get('/students', { params: { page, limit: 10, search: debounced, classId: classId || undefined } })).data })
  const classes = useQuery<{ data: ClassRow[] }>({ queryKey: ['classes-all'], queryFn: async () => (await api.get('/classes')).data })

  const save = useMutation({ mutationFn: async (payload: StudentForm & { id?: string }) => payload.id ? (await api.put(`/students/${payload.id}`, payload)).data : (await api.post('/students', payload)).data, onSuccess: async () => { toast.success('Student saved'); setOpen(false); setEditing(null); await qc.invalidateQueries({ queryKey: ['students'] }) }, onError: () => toast.error('Failed to save student') })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data, onSuccess: async () => { toast.success('Student deleted'); setDeleteId(null); await qc.invalidateQueries({ queryKey: ['students'] }) }, onError: () => toast.error('Delete failed') })

  const form = useForm<StudentForm>({ resolver: zodResolver(studentSchema), defaultValues: { adm_no: editing?.adm_no ?? '', name: editing?.name ?? '', classId: editing?.class?.id ?? '', email: editing?.email ?? '', phone: editing?.phone ?? '' } })

  const columns: Column<StudentRow>[] = [
    { key: 'adm_no', label: 'Adm No' },
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class', render: (row) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}` },
    { key: 'actions', label: 'Actions', render: (row) => <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(row); form.reset({ adm_no: row.adm_no, name: row.name, classId: row.class?.id ?? '', email: row.email ?? '', phone: row.phone ?? '' }); setOpen(true) }}>Edit</Button><Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}>Delete</Button></div> }
  ]

  return <Card title="Students" actions={<Button onClick={() => { setEditing(null); form.reset({ adm_no: '', name: '', classId: '', email: '', phone: '' }); setOpen(true) }}>Add Student</Button>}>
    <div className="mb-4 grid gap-2 md:grid-cols-2"><Input placeholder="Search students" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="rounded border px-3 py-2" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">All Classes</option>{(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}</select></div>
    <Table columns={columns} data={students.data?.data.data ?? []} loading={students.isLoading} keyExtractor={(r) => r.id} />
    <div className="mt-4"><Pagination page={students.data?.data.meta.page ?? 1} totalPages={students.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div>

    <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Student' : 'Add Student'} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button loading={save.isPending} onClick={form.handleSubmit((vals) => save.mutate({ ...vals, id: editing?.id }))}>Save</Button></>}>
      <div className="space-y-3"><Input label="Adm No" {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} /><Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} /><select className="w-full rounded border px-3 py-2" {...form.register('classId')}><option value="">Select class</option>{(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}</select><Input label="Email" {...form.register('email')} error={form.formState.errors.email?.message} /><Input label="Phone" {...form.register('phone')} /></div>
    </Modal>

    <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete student" footer={<><Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="danger" onClick={() => deleteId && remove.mutate(deleteId)} loading={remove.isPending}>Delete</Button></>}>
      <p>Are you sure you want to delete this student?</p>
    </Modal>
  </Card>
}
