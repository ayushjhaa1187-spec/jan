'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, StatCard } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface ListResponse<T> { data: { data: T[]; meta?: { total?: number } } }
interface AuditItem { id: string; action: string; entity: string; user: { name: string }; createdAt: string }
interface ExamItem { id: string; name: string; status: string; class?: { name: string } }
interface TeacherSubject { id: string; subject?: { name: string }; class?: { name: string; section: string } }

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const students = useQuery<ListResponse<{ id: string }>>({ queryKey: ['dashboard', 'students'], queryFn: async () => (await api.get('/students', { params: { limit: 1 } })).data })
  const exams = useQuery<ListResponse<ExamItem>>({ queryKey: ['dashboard', 'exams'], queryFn: async () => (await api.get('/exams', { params: { limit: 10 } })).data })
  const publishedExams = useQuery<ListResponse<ExamItem>>({ queryKey: ['dashboard', 'published'], queryFn: async () => (await api.get('/exams', { params: { status: 'PUBLISHED', limit: 1 } })).data })
  const reviewExams = useQuery<ListResponse<ExamItem>>({ queryKey: ['dashboard', 'review'], queryFn: async () => (await api.get('/exams', { params: { status: 'REVIEW', limit: 1 } })).data })
  const classes = useQuery<ListResponse<{ id: string }>>({ queryKey: ['dashboard', 'classes'], queryFn: async () => (await api.get('/classes', { params: { limit: 1 } })).data })
  const teachers = useQuery<ListResponse<{ id: string }>>({ queryKey: ['dashboard', 'teachers'], queryFn: async () => (await api.get('/teachers', { params: { limit: 1 } })).data })
  const audit = useQuery<ListResponse<AuditItem>>({ queryKey: ['dashboard', 'audit'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, enabled: user?.role === 'Principal' })
  const teacherAssignments = useQuery<ListResponse<TeacherSubject>>({ queryKey: ['dashboard', 'teacher-subjects', user?.id], queryFn: async () => (await api.get('/teacher-subjects', { params: { userId: user?.id, limit: 50 } })).data, enabled: user?.role === 'Teacher' && Boolean(user?.id) })

  const examColumns = useMemo<Column<ExamItem>[]>(() => [
    { key: 'name', label: 'Exam' },
    { key: 'class', label: 'Class', render: (row) => row.class?.name ?? '-' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
  ], [])

  if (user?.role === 'Principal') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Principal Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Students" value={students.data?.data.meta?.total ?? 0} />
          <StatCard title="Total Exams" value={exams.data?.data.meta?.total ?? 0} />
          <StatCard title="Published Exams" value={publishedExams.data?.data.meta?.total ?? 0} />
          <StatCard title="Pending Approval" value={reviewExams.data?.data.meta?.total ?? 0} />
        </div>
        <Card title="Recent Audit Logs">
          <Table
            columns={[
              { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' },
              { key: 'user', label: 'User', render: (row: AuditItem) => row.user.name },
              { key: 'createdAt', label: 'Time', render: (row: AuditItem) => new Date(row.createdAt).toLocaleString() },
            ]}
            data={audit.data?.data.data ?? []}
            loading={audit.isLoading}
            keyExtractor={(row) => row.id}
          />
        </Card>
      </div>
    )
  }

  if (user?.role === 'ExamDept') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Exam Department Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Approved Exams" value={Number(exams.data?.data.data.filter((exam) => exam.status === 'APPROVED').length ?? 0)} />
          <StatCard title="Review Exams" value={reviewExams.data?.data.meta?.total ?? 0} />
          <StatCard title="Published Exams" value={publishedExams.data?.data.meta?.total ?? 0} />
        </div>
        <Card title="Exam List"><Table columns={examColumns} data={exams.data?.data.data ?? []} loading={exams.isLoading} keyExtractor={(row) => row.id} /></Card>
      </div>
    )
  }

  if (user?.role === 'Teacher') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Card title="Subject Assignments">
          <Table
            columns={[
              { key: 'subject', label: 'Subject', render: (row: TeacherSubject) => row.subject?.name ?? '-' },
              { key: 'class', label: 'Class', render: (row: TeacherSubject) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}`.trim() },
            ]}
            data={teacherAssignments.data?.data.data ?? []}
            loading={teacherAssignments.isLoading}
            keyExtractor={(row) => row.id}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Office Staff Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Students" value={students.data?.data.meta?.total ?? 0} />
        <StatCard title="Classes" value={classes.data?.data.meta?.total ?? 0} />
        <StatCard title="Teachers" value={teachers.data?.data.meta?.total ?? 0} />
      </div>
      <Card title="Recent Students" actions={<Link className="text-sm text-[#2b6cb0]" href="/students">Add Student</Link>}>
        <Table
          columns={[{ key: 'name', label: 'Name' }, { key: 'adm_no', label: 'Adm No' }]}
          data={(students.data?.data.data as Array<{ id: string; name: string; adm_no: string }> | undefined) ?? []}
          loading={students.isLoading}
          keyExtractor={(row) => row.id}
        />
      </Card>
    </div>
  )
}
