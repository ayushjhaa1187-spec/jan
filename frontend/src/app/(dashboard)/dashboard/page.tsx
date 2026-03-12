'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'
import { PassFailChart } from '@/components/charts/PassFailChart'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const students = useQuery({ queryKey: ['dashboard', 'students-count'], queryFn: async () => (await api.get('/students', { params: { limit: 1 } })).data })
  const exams = useQuery({ queryKey: ['dashboard', 'exams-count'], queryFn: async () => (await api.get('/exams', { params: { limit: 1 } })).data })
  const reviewExams = useQuery({ queryKey: ['dashboard', 'review-count'], queryFn: async () => (await api.get('/exams', { params: { status: 'REVIEW', limit: 1 } })).data })
  const audit = useQuery({ queryKey: ['dashboard', 'audit'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, enabled: user?.role === 'Principal' })

  const cards = useMemo(() => {
    if (user?.role === 'Principal') {
      return [
        { label: 'Total Students', value: students.data?.data?.meta?.total ?? 0 },
        { label: 'Total Exams', value: exams.data?.data?.meta?.total ?? 0 },
        { label: 'Results Published', value: exams.data?.data?.data?.filter((item: { status: string }) => item.status === 'PUBLISHED').length ?? 0 },
        { label: 'Pending Approval', value: reviewExams.data?.data?.meta?.total ?? 0 },
      ]
    }

    if (user?.role === 'ExamDept') {
      return [
        { label: 'Active Exams', value: exams.data?.data?.data?.filter((item: { status: string }) => item.status === 'APPROVED').length ?? 0 },
        { label: 'Pending Review', value: reviewExams.data?.data?.meta?.total ?? 0 },
        { label: 'Results Ready', value: exams.data?.data?.data?.filter((item: { status: string }) => item.status === 'PUBLISHED').length ?? 0 },
      ]
    }

    if (user?.role === 'Teacher') {
      return [
        { label: 'My Classes', value: 0 },
        { label: 'Pending Marks', value: reviewExams.data?.data?.meta?.total ?? 0 },
      ]
    }

    return [
      { label: 'Total Students', value: students.data?.data?.meta?.total ?? 0 },
      { label: 'Total Classes', value: 0 },
      { label: 'Total Teachers', value: 0 },
    ]
  }, [user?.role, students.data, exams.data, reviewExams.data])

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>Dashboard</h1>
      <div className='grid gap-4 md:grid-cols-4'>
        {cards.map((card) => (
          <Card key={card.label} variant='compact'>
            <p className='text-sm text-slate-500'>{card.label}</p>
            <p className='text-2xl font-semibold'>{card.value}</p>
          </Card>
        ))}
      </div>

      {user?.role === 'Principal' ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          <Card title='Grade Distribution'>
            <GradeDistributionChart labels={['A', 'B', 'C', 'D']} values={[10, 20, 12, 3]} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f']} />
          </Card>
          <Card title='Pass / Fail'>
            <PassFailChart labels={['Pass', 'Fail', 'Incomplete']} values={[32, 8, 2]} />
          </Card>
        </div>
      ) : null}

      {user?.role === 'Principal' ? (
        <Card title='Recent Audit Logs'>
          <Table
            columns={[
              { key: 'user', label: 'User', render: (row) => ((row as { user?: { email?: string } }).user?.email || '-') },
              { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' },
            ]}
            data={audit.data?.data?.data ?? []}
            loading={audit.isLoading}
          />
        </Card>
      ) : null}
    </div>
  )
}
