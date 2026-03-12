'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const teacherId = params.id

  const teacher = useQuery({ queryKey: ['teacher', teacherId], queryFn: async () => (await api.get(`/teachers/${teacherId}`)).data })
  const assignments = useQuery({ queryKey: ['teacher-subjects', teacherId], queryFn: async () => (await api.get(`/teacher-subjects/teacher/${teacherId}`)).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  const teacherData = teacher.data?.data

  return (
    <div className='space-y-4'>
      <Card title='Teacher Profile'>
        <div className='grid gap-3 md:grid-cols-2'>
          <p><strong>Name:</strong> {teacherData ? `${teacherData.firstName} ${teacherData.lastName}` : '-'}</p>
          <p><strong>Employee ID:</strong> {teacherData?.employeeId}</p>
          <p><strong>Qualification:</strong> -</p>
          <p><strong>Designation:</strong> -</p>
          <p><strong>Phone:</strong> -</p>
        </div>
      </Card>

      <Card title='Subject Assignments'>
        <Table
          columns={[
            { key: 'subject', label: 'Subject', render: (row) => (row as { subject: { name: string } }).subject?.name || '-' },
            { key: 'class', label: 'Class', render: (row) => (row as { classId: string }).classId },
          ]}
          data={assignments.data?.data ?? []}
          loading={assignments.isLoading}
        />
      </Card>

      <Card title='Class Teacher Assignment'>
        <select className='rounded border px-3 py-2'>
          <option>Select class</option>
          {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
            <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
          ))}
        </select>
      </Card>
    </div>
  )
}
