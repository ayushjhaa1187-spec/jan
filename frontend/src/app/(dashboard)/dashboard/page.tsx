'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const students = useQuery({ queryKey: ['dash-students'], queryFn: async () => (await api.get('/students', { params: { page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const exams = useQuery({ queryKey: ['dash-exams'], queryFn: async () => (await api.get('/exams', { params: { page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const published = useQuery({ queryKey: ['dash-exams-published'], queryFn: async () => (await api.get('/exams', { params: { status: 'PUBLISHED', page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const review = useQuery({ queryKey: ['dash-exams-review'], queryFn: async () => (await api.get('/exams', { params: { status: 'REVIEW', page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const audit = useQuery({ queryKey: ['dash-audit'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, enabled: user?.role === 'Principal' })
  const teachers = useQuery({ queryKey: ['dash-teachers'], queryFn: async () => (await api.get('/teachers', { params: { page: 1, limit: 1 } })).data, enabled: user?.role === 'OfficeStaff' })
  const classes = useQuery({ queryKey: ['dash-classes'], queryFn: async () => (await api.get('/classes', { params: { page: 1, limit: 1 } })).data, enabled: user?.role === 'OfficeStaff' })
  const teacherSubjects = useQuery({ queryKey: ['dash-teacher-subjects', user?.id], queryFn: async () => (await api.get('/teacher-subjects', { params: { userId: user?.id } })).data, enabled: user?.role === 'Teacher' && Boolean(user?.id) })

  const examRows: Array<{ id: string; name: string; status: string }> = useMemo(() => exams.data?.data ?? [], [exams.data])

  if (user?.role === 'Principal') {
    return <div className="space-y-4"><div className="grid md:grid-cols-4 gap-3"><StatCard title="Students" value={students.data?.meta?.total ?? 0} /><StatCard title="Total Exams" value={exams.data?.meta?.total ?? 0} /><StatCard title="Published Exams" value={published.data?.meta?.total ?? 0} /><StatCard title="Pending Review" value={review.data?.meta?.total ?? 0} /></div><Card title="Recent Audit Log"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th></tr></thead><tbody>{(audit.data?.data ?? []).map((r: { id: string; createdAt: string; user: { name: string }; action: string; entity: string }) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.user?.name}</td><td>{r.action}</td><td>{r.entity}</td></tr>)}</tbody></table></div></Card></div>
  }

  if (user?.role === 'ExamDept') {
    return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><StatCard title="Approved" value={(awaitValue(exams.data, 'APPROVED'))} /><StatCard title="Review" value={review.data?.meta?.total ?? 0} /><StatCard title="Published" value={published.data?.meta?.total ?? 0} /></div><Card title="Exams"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Name</th><th>Status</th></tr></thead><tbody>{examRows.map((e) => <tr key={e.id}><td>{e.name}</td><td><Badge status={e.status} /></td></tr>)}</tbody></table></div></Card></div>
  }

  if (user?.role === 'Teacher') {
    return <Card title="Subject Assignments"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Subject</th><th>Class</th></tr></thead><tbody>{(teacherSubjects.data?.data ?? []).map((r: { id: string; subject: { name: string }; class: { name: string; section: string } }) => <tr key={r.id}><td>{r.subject?.name}</td><td>{r.class?.name} - {r.class?.section}</td></tr>)}</tbody></table></div></Card>
  }

  return <div className="space-y-4"><div className="grid md:grid-cols-3 gap-3"><StatCard title="Students" value={students.data?.meta?.total ?? 0} /><StatCard title="Classes" value={classes.data?.meta?.total ?? classes.data?.data?.length ?? 0} /><StatCard title="Teachers" value={teachers.data?.meta?.total ?? 0} /></div><Card title="Recent Students" actions={<Link href="/students/new"><Button>Add Student</Button></Link>}><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Adm No</th><th>Name</th></tr></thead><tbody>{(students.data?.data ?? []).slice(0, 10).map((s: { id: string; adm_no?: string; name?: string }) => <tr key={s.id}><td>{s.adm_no}</td><td>{s.name}</td></tr>)}</tbody></table></div></Card></div>
}

function awaitValue(data: unknown, status: string): number {
  const d = data as { data?: Array<{ status?: string }>; meta?: { total?: number } } | undefined
  if (d?.meta?.total && status === 'APPROVED') return d.meta.total
  return (d?.data ?? []).filter((r) => r.status === status).length
}
