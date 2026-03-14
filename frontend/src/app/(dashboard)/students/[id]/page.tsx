'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'

interface StudentRes { data: { id: string; name: string; adm_no: string; classId: string; class?: { name: string; section: string } } }
interface ResultRow { id: string; exam?: { name: string }; percentage?: number; grade?: string; status?: string }
interface ClassRow { id: string; name: string; section: string }

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [nextClassId, setNextClassId] = useState('')
  const qc = useQueryClient()

  const student = useQuery<StudentRes>({ queryKey: ['student', id], queryFn: async () => (await api.get(`/students/${id}`)).data })
  const results = useQuery<{ data: ResultRow[] }>({ queryKey: ['student-results', id], queryFn: async () => (await api.get(`/students/${id}/results`)).data })
  const classes = useQuery<{ data: ClassRow[] }>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const transfer = useMutation({ mutationFn: async () => (await api.patch(`/students/${id}/class`, { classId: nextClassId })).data, onSuccess: async () => { toast.success('Class transferred'); await qc.invalidateQueries({ queryKey: ['student', id] }) }, onError: () => toast.error('Transfer failed') })

  const cols: Column<ResultRow>[] = [
    { key: 'exam', label: 'Exam', render: (r) => r.exam?.name ?? '-' },
    { key: 'percentage', label: '%', render: (r) => String(r.percentage ?? 0) },
    { key: 'grade', label: 'Grade', render: (r) => r.grade ?? '-' },
    { key: 'status', label: 'Status', render: (r) => r.status ?? '-' }
  ]

  return <div className="space-y-4"><Card title="Student Info"><p><strong>Name:</strong> {student.data?.data.name}</p><p><strong>Adm No:</strong> {student.data?.data.adm_no}</p><p><strong>Class:</strong> {student.data?.data.class?.name} {student.data?.data.class?.section}</p></Card><Card title="Results History"><Table columns={cols} data={results.data?.data ?? []} keyExtractor={(r) => r.id} loading={results.isLoading} /></Card><Card title="Transfer Class"><div className="flex gap-2"><select value={nextClassId} onChange={(e) => setNextClassId(e.target.value)} className="rounded border px-3 py-2"><option value="">Select class</option>{(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}</select><Button onClick={() => transfer.mutate()} loading={transfer.isPending} disabled={!nextClassId}>Transfer</Button></div></Card></div>
}
