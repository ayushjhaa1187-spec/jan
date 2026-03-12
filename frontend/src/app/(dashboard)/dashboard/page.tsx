'use client'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { StatCard } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Users, FileText, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuthStore()

  if (!user) return <Spinner />

  if (user.role === 'Principal') return <PrincipalDashboard />
  if (user.role === 'ExamDept') return <ExamDeptDashboard />
  if (user.role === 'Teacher') return <TeacherDashboard userId={user.id} />
  return <OfficeStaffDashboard />
}

function PrincipalDashboard() {
  const { data: students } = useQuery({ queryKey: ['students-count'], queryFn: () => api.get('/students?limit=1') })
  const { data: exams } = useQuery({ queryKey: ['exams-count'], queryFn: () => api.get('/exams?limit=1') })
  const { data: published } = useQuery({ queryKey: ['published-count'], queryFn: () => api.get('/exams?status=PUBLISHED&limit=1') })
  const { data: pending } = useQuery({ queryKey: ['pending-count'], queryFn: () => api.get('/exams?status=REVIEW&limit=1') })
  const { data: audit } = useQuery({ queryKey: ['recent-audit'], queryFn: () => api.get('/audit?limit=10') })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Principal Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={(students?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} icon={<Users className="w-8 h-8" />} />
        <StatCard title="Total Exams" value={(exams?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} icon={<FileText className="w-8 h-8" />} color="#276749" />
        <StatCard title="Published Results" value={(published?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} icon={<CheckCircle className="w-8 h-8" />} color="#276749" />
        <StatCard title="Pending Approval" value={(pending?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} icon={<Clock className="w-8 h-8" />} color="#b7791f" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Table
          columns={[
            { key: 'user', label: 'User', render: (row: { user?: { name: string } }) => row.user?.name ?? '—' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'createdAt', label: 'Time', render: (row: { createdAt: string }) => formatDate(row.createdAt) },
          ]}
          data={((audit?.data as { data?: { data?: Array<{ id: string; user?: { name: string }; action: string; entity: string; createdAt: string }> } })?.data?.data) ?? []}
          keyExtractor={(row: { id: string }) => row.id}
          emptyMessage="No recent activity"
        />
      </div>
    </div>
  )
}

function ExamDeptDashboard() {
  const { data: active } = useQuery({ queryKey: ['active-exams'], queryFn: () => api.get('/exams?status=APPROVED&limit=1') })
  const { data: review } = useQuery({ queryKey: ['review-exams'], queryFn: () => api.get('/exams?status=REVIEW&limit=1') })
  const { data: published } = useQuery({ queryKey: ['pub-exams'], queryFn: () => api.get('/exams?status=PUBLISHED&limit=1') })
  const { data: exams } = useQuery({ queryKey: ['exams-list'], queryFn: () => api.get('/exams?limit=10') })
  const router = useRouter()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Exam Department Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Exams" value={(active?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} color="#2b6cb0" />
        <StatCard title="Pending Review" value={(review?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} color="#b7791f" />
        <StatCard title="Results Published" value={(published?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} color="#276749" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Exams</h2>
        <Table
          columns={[
            { key: 'name', label: 'Exam Name' },
            { key: 'class', label: 'Class', render: (row: { class?: { name: string; section: string } }) => row.class ? `${row.class.name}-${row.class.section}` : '—' },
            { key: 'status', label: 'Status', render: (row: { status: string }) => <Badge status={row.status} /> },
            { key: 'actions', label: '', render: (row: { id: string }) => (
              <button onClick={() => router.push(`/exams/${row.id}`)} className="text-[#2b6cb0] text-sm hover:underline">View</button>
            )},
          ]}
          data={((exams?.data as { data?: { data?: Array<{ id: string; name: string; class?: { name: string; section: string }; status: string }> } })?.data?.data) ?? []}
          keyExtractor={(row: { id: string }) => row.id}
        />
      </div>
    </div>
  )
}

function TeacherDashboard({ userId }: { userId: string }) {
  const { data: assignments } = useQuery({
    queryKey: ['teacher-assignments', userId],
    queryFn: async () => {
      const teacherRes = await api.get(`/teachers?search=${userId}&limit=1`)
      const teachers = ((teacherRes.data as { data?: Array<{ id: string }> }).data) ?? []
      if (!teachers.length) return { data: [] }
      const res = await api.get(`/teacher-subjects/teacher/${teachers[0].id}`)
      return res.data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">My Subject Assignments</h2>
        <Table
          columns={[
            { key: 'subject', label: 'Subject', render: (row: { subject?: { name: string } }) => row.subject?.name ?? '—' },
            { key: 'class', label: 'Class', render: (row: { class?: { name: string; section: string } }) => row.class ? `${row.class.name}-${row.class.section}` : '—' },
          ]}
          data={((assignments as { data?: { data?: Array<{ id: string; subject?: { name: string }; class?: { name: string; section: string } }> } })?.data?.data) ?? []}
          keyExtractor={(row: { id: string }) => row.id}
          emptyMessage="No subject assignments found"
        />
      </div>
    </div>
  )
}

function OfficeStaffDashboard() {
  const router = useRouter()
  const { data: students } = useQuery({ queryKey: ['students-stat'], queryFn: () => api.get('/students?limit=1') })
  const { data: classes } = useQuery({ queryKey: ['classes-stat'], queryFn: () => api.get('/classes') })
  const { data: teachers } = useQuery({ queryKey: ['teachers-stat'], queryFn: () => api.get('/teachers?limit=1') })
  const { data: recentStudents } = useQuery({ queryKey: ['recent-students'], queryFn: () => api.get('/students?limit=5&page=1') })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Office Staff Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={(students?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} icon={<Users className="w-8 h-8" />} />
        <StatCard title="Total Classes" value={((classes?.data as { data?: Array<unknown> })?.data?.length) ?? '—'} color="#276749" />
        <StatCard title="Total Teachers" value={(teachers?.data as { data?: { meta?: { total?: number } } })?.data?.meta?.total ?? '—'} color="#2b6cb0" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Students</h2>
          <button onClick={() => router.push('/students/new')} className="text-sm text-[#2b6cb0] hover:underline">+ Add Student</button>
        </div>
        <Table
          columns={[
            { key: 'adm_no', label: 'Adm No' },
            { key: 'name', label: 'Name' },
            { key: 'class', label: 'Class', render: (row: { class?: { name: string; section: string } }) => row.class ? `${row.class.name}-${row.class.section}` : '—' },
          ]}
          data={((recentStudents?.data as { data?: { data?: Array<{ id: string; adm_no?: string; name?: string; class?: { name: string; section: string } }> } })?.data?.data) ?? []}
          keyExtractor={(row: { id: string }) => row.id}
        />
      </div>
    </div>
  )
}
