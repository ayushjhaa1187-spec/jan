'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'

interface TeacherData {
  firstName: string
  lastName: string
  employeeId?: string
}

interface TeacherResponse {
  data: TeacherData
}

interface AssignmentRow {
  id: string
  subject?: { name?: string }
  classId?: string
}

interface AssignmentsResponse {
  data: AssignmentRow[]
}

interface ClassItem {
  id: string
  name: string
  section: string
}

interface ClassesResponse {
  data: ClassItem[]
}

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const teacherId = params.id

  const teacher = useQuery<TeacherResponse>({
    queryKey: ['teacher', teacherId],
    queryFn: async () => (await api.get(`/teachers/${teacherId}`)).data
  })

  const assignments = useQuery<AssignmentsResponse>({
    queryKey: ['teacher-subjects', teacherId],
    queryFn: async () => (await api.get(`/teacher-subjects/teacher/${teacherId}`)).data
  })

  const classes = useQuery<ClassesResponse>({
    queryKey: ['classes'],
    queryFn: async () => (await api.get('/classes')).data
  })

  const teacherData = teacher.data?.data

  const columns: Column<AssignmentRow>[] = [
    { key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' },
    { key: 'class', label: 'Class', render: (row) => row.classId ?? '-' }
  ]

  return (
    <div className="space-y-4">
      <Card title="Teacher Profile">
        <div className="grid gap-3 md:grid-cols-2">
          <p>
            <strong>Name:</strong> {teacherData ? `${teacherData.firstName} ${teacherData.lastName}` : '-'}
          </p>
          <p>
            <strong>Employee ID:</strong> {teacherData?.employeeId ?? '-'}
          </p>
          <p>
            <strong>Qualification:</strong> -
          </p>
          <p>
            <strong>Designation:</strong> -
          </p>
          <p>
            <strong>Phone:</strong> -
          </p>
        </div>
      </Card>

      <Card title="Subject Assignments">
        <Table
          columns={columns}
          data={assignments.data?.data ?? []}
          loading={assignments.isLoading}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Card title="Class Teacher Assignment">
        <select className="rounded border px-3 py-2">
          <option>Select class</option>
          {(classes.data?.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.section}
            </option>
          ))}
        </select>
      </Card>
    </div>
  )
}
