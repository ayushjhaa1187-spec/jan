'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import PassFailChart from '@/components/charts/PassFailChart';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';

interface MetaResponse {
  success: boolean;
  data: unknown[];
  meta: { total: number };
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const studentsCount = useQuery({ queryKey: ['dash-students-count'], queryFn: async () => (await api.get<MetaResponse>('/students', { params: { limit: 1 } })).data.meta.total });
  const examsCount = useQuery({ queryKey: ['dash-exams-count'], queryFn: async () => (await api.get<MetaResponse>('/exams', { params: { limit: 1 } })).data.meta.total });
  const publishedResultsCount = useQuery({ queryKey: ['dash-published-results'], queryFn: async () => (await api.get<MetaResponse>('/results', { params: { status: 'PUBLISHED', limit: 1 } })).data.meta.total, retry: 0 });
  const pendingApprovalCount = useQuery({ queryKey: ['dash-pending-review'], queryFn: async () => (await api.get<MetaResponse>('/exams', { params: { status: 'REVIEW', limit: 1 } })).data.meta.total });
  const audits = useQuery({ queryKey: ['dash-audits'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, retry: 0 });
  const exams = useQuery({ queryKey: ['dash-exam-list'], queryFn: async () => (await api.get('/exams', { params: { limit: 10 } })).data });

  const stat = (title: string, value: number | undefined) => <Card title={title}><p className='text-2xl font-semibold'>{value ?? 0}</p></Card>;

  if (user?.role === 'Principal') {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {stat('Total Students', studentsCount.data)}
          {stat('Total Exams', examsCount.data)}
          {stat('Results Published', publishedResultsCount.data)}
          {stat('Pending Approval', pendingApprovalCount.data)}
        </div>
        <div className='grid md:grid-cols-2 gap-4'>
          <Card title='Grade Distribution'>
            <GradeDistributionChart labels={['A', 'B', 'C', 'D', 'F']} values={[25, 40, 20, 10, 5]} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f', '#c53030']} />
          </Card>
          <Card title='Pass/Fail'>
            <PassFailChart labels={['PASS', 'FAIL', 'INCOMPLETE']} values={[88, 8, 4]} />
          </Card>
        </div>
        <Card title='Recent Audit Logs'>
          <Table
            columns={[
              { key: 'user', label: 'User', render: (row: { user?: { email?: string } }) => row.user?.email || 'System' },
              { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' },
              { key: 'createdAt', label: 'Time', render: (row: { createdAt: string }) => formatDate(row.createdAt) },
            ]}
            data={audits.data?.data ?? []}
          />
        </Card>
      </div>
    );
  }

  if (user?.role === 'ExamDept') {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {stat('Active Exams', (exams.data?.data ?? []).filter((item: { status: string }) => item.status === 'APPROVED').length)}
          {stat('Pending Review', pendingApprovalCount.data)}
          {stat('Results Ready', (exams.data?.data ?? []).filter((item: { status: string }) => item.status === 'PUBLISHED').length)}
        </div>
        <Card title='Exams'>
          <Table
            columns={[
              { key: 'name', label: 'Exam' },
              { key: 'status', label: 'Status' },
              { key: 'startDate', label: 'Start', render: (row: { startDate: string }) => formatDate(row.startDate) },
            ]}
            data={exams.data?.data ?? []}
          />
        </Card>
      </div>
    );
  }

  if (user?.role === 'Teacher') {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {stat('My Classes', 0)}
          {stat('Pending Marks', pendingApprovalCount.data)}
        </div>
        <Card title='Subject Assignments'>
          <Table columns={[{ key: 'name', label: 'Subject' }, { key: 'class', label: 'Class' }]} data={[]} emptyMessage='No subject assignments found' />
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {stat('Total Students', studentsCount.data)}
        {stat('Total Classes', undefined)}
        {stat('Total Teachers', undefined)}
      </div>
      <Card title='Recent Students'>
        <Table
          columns={[{ key: 'adm_no', label: 'Adm No' }, { key: 'name', label: 'Name' }]}
          data={studentsCount.data ? [] : []}
          emptyMessage='No student data available'
        />
      </Card>
    </div>
  );
}
