'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Table } from '@/components/ui/Table'

interface StudentResponse { data: { id: string; name: string; adm_no: string; classId: string; class?: { name: string; section: string } } }
interface ResultsResponse { data: Array<{ id: string; examName: string; percent: number; grade: string; status: string }> }
interface ClassesResponse { data: Array<{ id: string; name: string; section: string }> }

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [nextClassId, setNextClassId] = useState('')
  const queryClient = useQueryClient()

  const student = useQuery<StudentResponse>({ queryKey: ['student', id], queryFn: async () => (await api.get(`/students/${id}`)).data })
  const results = useQuery<ResultsResponse>({ queryKey: ['student', id, 'results'], queryFn: async () => (await api.get(`/students/${id}/results`)).data })
  const classes = useQuery<ClassesResponse>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  const transfer = useMutation({
    mutationFn: async (classId: string) => (await api.patch(`/students/${id}/class`, { classId })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', id] })
      toast.success('Class transferred')
    }
  })

  return (
    <div className="space-y-4">
      <Card title="Student Info">
        <p><strong>Name:</strong> {student.data?.data.name}</p>
        <p><strong>Admission No:</strong> {student.data?.data.adm_no}</p>
        <p><strong>Current Class:</strong> {student.data?.data.class?.name} {student.data?.data.class?.section}</p>
      </Card>

      <Card title="Results History">
        <Table
          columns={[{ key: 'examName', label: 'Exam' }, { key: 'percent', label: '%' }, { key: 'grade', label: 'Grade' }, { key: 'status', label: 'Status' }]}
          data={results.data?.data ?? []}
          loading={results.isLoading}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Card title="Transfer Class">
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-lg border px-3 py-2" value={nextClassId} onChange={(event) => setNextClassId(event.target.value)}>
            <option value="">Select class</option>
            {(classes.data?.data ?? []).map((item) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
          </select>
          <Button loading={transfer.isPending} onClick={() => nextClassId && void transfer.mutateAsync(nextClassId)}>Transfer</Button>
        </div>
      </Card>
    </div>
  )
}
