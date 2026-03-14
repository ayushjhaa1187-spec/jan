'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'

interface Teacher { id: string; employeeId: string; qualification?: string; designation?: string; phone?: string; user?: { name: string; email: string } }
interface Assignment { id: string; subject?: { name: string }; class?: { name: string; section: string } }

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id

  const teacher = useQuery({ queryKey: ['teacher', id], queryFn: async () => (await api.get<{ data: Teacher }>(`/teachers/${id}`)).data })
  const assignments = useQuery({ queryKey: ['teacher-subjects', id], queryFn: async () => (await api.get<{ data: Assignment[] }>(`/teacher-subjects/teacher/${id}`)).data })

  const columns: Column<Assignment>[] = [
    { key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' },
    { key: 'class', label: 'Class', render: (row) => row.class ? `${row.class.name} - ${row.class.section}` : '-' },
  ]

  return (
    <div className="space-y-4">
      <Card title="Teacher Profile">
        <p><strong>Name:</strong> {teacher.data?.data.user?.name ?? '-'}</p>
        <p><strong>Email:</strong> {teacher.data?.data.user?.email ?? '-'}</p>
        <p><strong>Employee ID:</strong> {teacher.data?.data.employeeId ?? '-'}</p>
        <p><strong>Designation:</strong> {teacher.data?.data.designation ?? '-'}</p>
      </Card>
      <Card title="Subject Assignments">
        <Table columns={columns} data={assignments.data?.data ?? []} keyExtractor={(row) => row.id} loading={assignments.isLoading} />
      </Card>
    </div>
  )
}
