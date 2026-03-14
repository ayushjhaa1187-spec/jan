'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { StatCard, Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'

interface CountRes { data: { meta?: { total?: number }; data?: unknown[] } }
interface AuditRow { id: string; action: string; entity: string; user?: { name: string }; createdAt: string }
interface ExamRow { id: string; name: string; status: string; class?: { name: string } }
interface TeacherSubRow { id: string; subject?: { name: string }; class?: { name: string } }

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const students = useQuery<CountRes>({ queryKey: ['d-students'], queryFn: async () => (await api.get('/students', { params: { limit: 1 } })).data })
  const exams = useQuery<CountRes>({ queryKey: ['d-exams'], queryFn: async () => (await api.get('/exams', { params: { limit: 1 } })).data })
  const published = useQuery<CountRes>({ queryKey: ['d-exams-pub'], queryFn: async () => (await api.get('/exams', { params: { status: 'PUBLISHED', limit: 1 } })).data })
  const review = useQuery<CountRes>({ queryKey: ['d-exams-review'], queryFn: async () => (await api.get('/exams', { params: { status: 'REVIEW', limit: 1 } })).data })
  const classes = useQuery<CountRes>({ queryKey: ['d-classes'], queryFn: async () => (await api.get('/classes', { params: { limit: 1 } })).data })
  const teachers = useQuery<CountRes>({ queryKey: ['d-teachers'], queryFn: async () => (await api.get('/teachers', { params: { limit: 1 } })).data })
  const audit = useQuery<{ data: AuditRow[] }>({ queryKey: ['d-audit'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, enabled: user?.role === 'Principal' })
  const examRows = useQuery<{ data: ExamRow[] }>({ queryKey: ['d-exam-list'], queryFn: async () => (await api.get('/exams', { params: { limit: 8 } })).data, enabled: user?.role === 'ExamDept' })
  const assignmentRows = useQuery<{ data: TeacherSubRow[] }>({ queryKey: ['d-assignments', user?.id], queryFn: async () => (await api.get('/teacher-subjects', { params: { userId: user?.id } })).data, enabled: user?.role === 'Teacher' && Boolean(user?.id) })

  const count = (q: CountRes | undefined) => q?.data?.meta?.total ?? q?.data?.data?.length ?? 0

  if (user?.role === 'Principal') {
    const cols: Column<AuditRow>[] = [
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'user', label: 'User', render: (r) => r.user?.name ?? '-' },
      { key: 'time', label: 'Time', render: (r) => new Date(r.createdAt).toLocaleString() }
    ]
    return <div className="space-y-4"><div className="grid md:grid-cols-4 gap-3"><StatCard title="Total Students" value={count(students.data)} /><StatCard title="Total Exams" value={count(exams.data)} /><StatCard title="Published" value={count(published.data)} /><StatCard title="Pending Review" value={count(review.data)} /></div><Card title="Recent Audit Logs"><Table columns={cols} data={audit.data?.data ?? []} keyExtractor={(r) => r.id} loading={audit.isLoading} /></Card></div>
  }

  if (user?.role === 'ExamDept') {
    const cols: Column<ExamRow>[] = [
      { key: 'name', label: 'Exam' },
      { key: 'class', label: 'Class', render: (r) => r.class?.name ?? '-' },
      { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }
    ]
    return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><StatCard title="Approved" value={count({ data: exams.data?.data ?? {} })} /><StatCard title="Review" value={count(review.data)} /><StatCard title="Published" value={count(published.data)} /></div><Card title="Recent Exams"><Table columns={cols} data={examRows.data?.data ?? []} keyExtractor={(r) => r.id} loading={examRows.isLoading} /></Card></div>
  }

  if (user?.role === 'Teacher') {
    const cols: Column<TeacherSubRow>[] = [
      { key: 'subject', label: 'Subject', render: (r) => r.subject?.name ?? '-' },
      { key: 'class', label: 'Class', render: (r) => r.class?.name ?? '-' }
    ]
    return <Card title="My Subject Assignments"><Table columns={cols} data={assignmentRows.data?.data ?? []} keyExtractor={(r) => r.id} loading={assignmentRows.isLoading} /></Card>
  }

  const staffCols: Column<{ id: string; name?: string; adm_no?: string }>[] = [{ key: 'name', label: 'Name' }, { key: 'adm_no', label: 'Adm No' }]
  return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><StatCard title="Students" value={count(students.data)} /><StatCard title="Classes" value={count(classes.data)} /><StatCard title="Teachers" value={count(teachers.data)} /></div><Card title="Recent Students" actions={<a className="text-sm text-[#2b6cb0]" href="/students">Add Student</a>}><Table columns={staffCols} data={(students.data?.data?.data as { id: string; name?: string; adm_no?: string }[] | undefined) ?? []} keyExtractor={(r) => r.id} loading={students.isLoading} /></Card></div>
}
