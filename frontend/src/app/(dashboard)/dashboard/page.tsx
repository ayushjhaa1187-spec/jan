'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import PassFailChart from '@/components/charts/PassFailChart';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';
import TopPerformersChart from '@/components/charts/TopPerformersChart';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const studentsCount = useQuery({ queryKey: ['dashboard', 'students'], queryFn: async () => (await api.get('/students?limit=1')).data.data.meta.total });
  const examsCount = useQuery({ queryKey: ['dashboard', 'exams'], queryFn: async () => (await api.get('/exams?limit=1')).data.data.meta.total });
  const reviewCount = useQuery({ queryKey: ['dashboard', 'review'], queryFn: async () => (await api.get('/exams?status=REVIEW&limit=1')).data.data.meta.total });
  const publishedResults = useQuery({ queryKey: ['dashboard', 'published-results'], queryFn: async () => (await api.get('/results?status=PUBLISHED&limit=1')).data.data.meta?.total ?? 0, retry: 0 });
  const audits = useQuery({ queryKey: ['dashboard', 'audit'], queryFn: async () => (await api.get('/audit?limit=10')).data.data ?? [], retry: 0 });

  const stats = [
    { label: 'Total Students', value: studentsCount.data ?? 0 },
    { label: 'Total Exams', value: examsCount.data ?? 0 },
    { label: 'Results Published', value: publishedResults.data ?? 0 },
    { label: 'Pending Approval', value: reviewCount.data ?? 0 },
  ];

  if (user?.role === 'Teacher') {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card title='My Classes'><p className='text-2xl font-semibold'>{studentsCount.data ?? 0}</p></Card>
          <Card title='Pending Marks'><p className='text-2xl font-semibold'>{reviewCount.data ?? 0}</p></Card>
        </div>
        <Card title='Performance Overview'>
          <TopPerformersChart labels={['Class A', 'Class B']} values={[85, 78]} />
        </Card>
      </div>
    );
  }

  if (user?.role === 'ExamDept') {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card title='Active Exams'><p className='text-2xl font-semibold'>{examsCount.data ?? 0}</p></Card>
          <Card title='Pending Review'><p className='text-2xl font-semibold'>{reviewCount.data ?? 0}</p></Card>
          <Card title='Results Ready'><p className='text-2xl font-semibold'>{publishedResults.data ?? 0}</p></Card>
        </div>
      </div>
    );
  }

  if (user?.role === 'OfficeStaff') {
    return (
      <div className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card title='Total Students'><p className='text-2xl font-semibold'>{studentsCount.data ?? 0}</p></Card>
          <Card title='Total Classes'><p className='text-2xl font-semibold'>--</p></Card>
          <Card title='Total Teachers'><p className='text-2xl font-semibold'>--</p></Card>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-4'>
        {stats.map((item) => (
          <Card key={item.label} title={item.label}><p className='text-2xl font-semibold'>{item.value}</p></Card>
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card title='Grade Distribution'><GradeDistributionChart labels={['A', 'B', 'C', 'D']} values={[20, 15, 8, 3]} colors={['#1a365d', '#2b6cb0', '#3182ce', '#63b3ed']} /></Card>
        <Card title='Pass / Fail'><PassFailChart labels={['Pass', 'Fail', 'Incomplete']} values={[40, 4, 1]} /></Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card title='Subject Averages'><SubjectAveragesChart labels={['Math', 'Science', 'English']} values={[78, 72, 84]} /></Card>
        <Card title='Top Performers'><TopPerformersChart labels={['Amit', 'Neha', 'Rahul']} values={[92, 89, 87]} /></Card>
      </div>

      <Card title='Recent Audit Logs'>
        <Table
          columns={[
            { key: 'user', label: 'User', render: (row) => row.user?.email ?? '-' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'createdAt', label: 'Time', render: (row) => formatDate(row.createdAt) },
          ]}
          data={audits.data ?? []}
          loading={audits.isLoading}
        />
      </Card>
    </div>
  );
}
