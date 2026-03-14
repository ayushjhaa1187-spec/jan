'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

interface TeacherDetail { data: { id: string; employeeId: string; user?: { name: string; email: string }; designation?: string; qualification?: string; phone?: string } }
interface AssignmentResponse { data: Array<{ id: string; subject?: { name: string }; class?: { name: string; section: string } }> }

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const teacher = useQuery<TeacherDetail>({ queryKey: ['teacher', params.id], queryFn: async () => (await api.get(`/teachers/${params.id}`)).data })
  const assignments = useQuery<AssignmentResponse>({ queryKey: ['teacher-assignments', params.id], queryFn: async () => (await api.get(`/teacher-subjects/teacher/${params.id}`)).data })

  return (
    <div className='space-y-4'>
      <Card title='Teacher Profile'>
        <div className='grid gap-2 md:grid-cols-2'>
          <p><strong>Name:</strong> {teacher.data?.data.user?.name ?? '-'}</p>
          <p><strong>Email:</strong> {teacher.data?.data.user?.email ?? '-'}</p>
          <p><strong>Employee ID:</strong> {teacher.data?.data.employeeId ?? '-'}</p>
          <p><strong>Designation:</strong> {teacher.data?.data.designation ?? '-'}</p>
          <p><strong>Qualification:</strong> {teacher.data?.data.qualification ?? '-'}</p>
          <p><strong>Phone:</strong> {teacher.data?.data.phone ?? '-'}</p>
        </div>
      </Card>
      <Card title='Subject Assignments'>
        <Table columns={[{ key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' }, { key: 'class', label: 'Class', render: (row) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}`.trim() }]} data={assignments.data?.data ?? []} loading={assignments.isLoading} keyExtractor={(row) => row.id} />
      </Card>
    </div>
  )
}
