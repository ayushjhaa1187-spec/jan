'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table, Column } from '@/components/ui/Table'

interface StudentDetail { id: string; name: string; adm_no: string; classId: string; class?: { name: string; section: string } }
interface ResultRow { id: string; exam?: { name: string }; percentage: number; grade: string; status: string }
interface ClassRow { id: string; name: string; section: string }

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const queryClient = useQueryClient()
  const [newClassId, setNewClassId] = useState('')

  const student = useQuery({ queryKey: ['student', id], queryFn: async () => (await api.get<{ data: StudentDetail }>(`/students/${id}`)).data })
  const results = useQuery({ queryKey: ['student-results', id], queryFn: async () => (await api.get<{ data: ResultRow[] }>(`/students/${id}/results`)).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: ClassRow[] }>('/classes')).data })

  const transfer = useMutation({ mutationFn: async (classId: string) => (await api.patch(`/students/${id}/class`, { classId })).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['student', id] }); toast.success('Class transferred') } })

  const columns: Column<ResultRow>[] = [
    { key: 'exam', label: 'Exam', render: (row) => row.exam?.name ?? '-' },
    { key: 'percentage', label: '%', render: (row) => `${row.percentage}%` },
    { key: 'grade', label: 'Grade' },
    { key: 'status', label: 'Status' }
  ]

  return (
    <div className="space-y-4">
      <Card title="Student Info">
        <p><strong>Name:</strong> {student.data?.data.name}</p>
        <p><strong>Admission No:</strong> {student.data?.data.adm_no}</p>
        <p><strong>Class:</strong> {student.data?.data.class ? `${student.data.data.class.name} - ${student.data.data.class.section}` : '-'}</p>
      </Card>
      <Card title="Results History">
        <Table columns={columns} data={results.data?.data ?? []} keyExtractor={(row) => row.id} loading={results.isLoading} />
      </Card>
      <Card title="Transfer Class">
        <div className="flex gap-2">
          <select className="rounded-lg border px-3 py-2" value={newClassId} onChange={(e) => setNewClassId(e.target.value)}>
            <option value="">Select class</option>
            {(classes.data?.data ?? []).map((cls) => <option key={cls.id} value={cls.id}>{cls.name} - {cls.section}</option>)}
          </select>
          <Button onClick={() => void transfer.mutateAsync(newClassId)} disabled={!newClassId} loading={transfer.isPending}>Transfer</Button>
        </div>
      </Card>
    </div>
  )
}
