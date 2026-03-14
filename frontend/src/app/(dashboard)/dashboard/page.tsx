'use client'

import { useQuery } from '@tanstack/react-query'
import { Users, FileText, CheckCircle2, Clock3, School, UserCheck } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, StatCard } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface CountResponse { data: { meta?: { total?: number }; data?: unknown[] } }
interface AuditRow { id: string; action: string; entity: string; createdAt: string; user: { name: string } }
interface ExamRow { id: string; name: string; status: string; class?: { name: string } }
interface AssignmentRow { id: string; subject?: { name?: string }; class?: { name?: string } }

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const students = useQuery({ queryKey: ['count-students'], queryFn: async () => (await api.get<CountResponse>('/students', { params: { limit: 1 } })).data })
  const exams = useQuery({ queryKey: ['count-exams'], queryFn: async () => (await api.get<CountResponse>('/exams', { params: { limit: 1 } })).data })
  const published = useQuery({ queryKey: ['count-exams-pub'], queryFn: async () => (await api.get<CountResponse>('/exams', { params: { limit: 1, status: 'PUBLISHED' } })).data })
  const review = useQuery({ queryKey: ['count-exams-review'], queryFn: async () => (await api.get<CountResponse>('/exams', { params: { limit: 1, status: 'REVIEW' } })).data })
  const approved = useQuery({ queryKey: ['count-exams-approved'], queryFn: async () => (await api.get<CountResponse>('/exams', { params: { limit: 1, status: 'APPROVED' } })).data })
  const classes = useQuery({ queryKey: ['count-classes'], queryFn: async () => (await api.get<CountResponse>('/classes', { params: { limit: 1 } })).data })
  const teachers = useQuery({ queryKey: ['count-teachers'], queryFn: async () => (await api.get<CountResponse>('/teachers', { params: { limit: 1 } })).data })

  const audit = useQuery({ queryKey: ['audit', 'recent'], queryFn: async () => (await api.get<{ data: AuditRow[] }>('/audit', { params: { limit: 10 } })).data })
  const examList = useQuery({ queryKey: ['exams', 'dept'], queryFn: async () => (await api.get<{ data: ExamRow[] }>('/exams', { params: { page: 1, limit: 10 } })).data })
  const assignments = useQuery({ queryKey: ['teacher-subjects', user?.id], enabled: Boolean(user?.id), queryFn: async () => (await api.get<{ data: AssignmentRow[] }>('/teacher-subjects', { params: { userId: user?.id } })).data })

  if (user?.role === 'Principal') {
    const columns: Column<AuditRow>[] = [
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'user', label: 'User', render: (row) => row.user.name },
      { key: 'createdAt', label: 'Time', render: (row) => new Date(row.createdAt).toLocaleString() },
    ]
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard title="Students" value={students.data?.data.meta?.total ?? 0} icon={<Users />} />
          <StatCard title="Exams" value={exams.data?.data.meta?.total ?? 0} icon={<FileText />} />
          <StatCard title="Published" value={published.data?.data.meta?.total ?? 0} icon={<CheckCircle2 />} />
          <StatCard title="Pending Review" value={review.data?.data.meta?.total ?? 0} icon={<Clock3 />} />
        </div>
        <Card title="Recent Audit Logs">
          <Table columns={columns} data={audit.data?.data ?? []} keyExtractor={(row) => row.id} loading={audit.isLoading} />
        </Card>
      </div>
    )
  }

  if (user?.role === 'ExamDept') {
    const columns: Column<ExamRow>[] = [
      { key: 'name', label: 'Exam' },
      { key: 'class', label: 'Class', render: (row) => row.class?.name ?? '-' },
      { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> }
    ]
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Approved Exams" value={approved.data?.data.meta?.total ?? 0} />
          <StatCard title="In Review" value={review.data?.data.meta?.total ?? 0} />
          <StatCard title="Published" value={published.data?.data.meta?.total ?? 0} />
        </div>
        <Card title="Latest Exams">
          <Table columns={columns} data={examList.data?.data ?? []} keyExtractor={(row) => row.id} loading={examList.isLoading} />
        </Card>
      </div>
    )
  }

  if (user?.role === 'Teacher') {
    const columns: Column<AssignmentRow>[] = [
      { key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' },
      { key: 'class', label: 'Class', render: (row) => row.class?.name ?? '-' }
    ]
    return (
      <Card title="Subject Assignments">
        <Table columns={columns} data={assignments.data?.data ?? []} keyExtractor={(row) => row.id} loading={assignments.isLoading} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Students" value={students.data?.data.meta?.total ?? 0} icon={<Users />} />
        <StatCard title="Classes" value={classes.data?.data.meta?.total ?? 0} icon={<School />} />
        <StatCard title="Teachers" value={teachers.data?.data.meta?.total ?? 0} icon={<UserCheck />} />
      </div>
      <Card title="Recent Students" actions={<a href="/students" className="text-sm text-[#2b6cb0]">Add Student</a>}>
        <p className="text-sm text-gray-600">Use Students section to create and update student records.</p>
      </Card>
    </div>
  )
}
