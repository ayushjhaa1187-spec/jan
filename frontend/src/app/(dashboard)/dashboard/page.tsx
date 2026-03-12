'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import PassFailChart from '@/components/charts/PassFailChart';
import { Badge } from '@/components/ui/Badge';
import { AuditLog, Exam, PaginatedResponse, Student, TeacherSubject } from '@/types';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const studentsQuery = useQuery({
    queryKey: ['dashboard', 'studentsCount'],
    queryFn: async () => (await api.get<{ data: PaginatedResponse<Student> }>('/students', { params: { limit: 1 } })).data.data.meta.total,
  });
  const examsQuery = useQuery({
    queryKey: ['dashboard', 'examsCount'],
    queryFn: async () => (await api.get<{ data: PaginatedResponse<Exam> }>('/exams', { params: { limit: 1 } })).data.data.meta.total,
  });
  const reviewExamsQuery = useQuery({
    queryKey: ['dashboard', 'reviewExamsCount'],
    queryFn: async () =>
      (await api.get<{ data: Exam[]; meta: PaginatedResponse<Exam>['meta'] }>('/exams', { params: { status: 'REVIEW', limit: 1 } })).data.meta.total,
  });
  const publishedResultsQuery = useQuery({
    queryKey: ['dashboard', 'publishedResults'],
    queryFn: async () =>
      (await api.get<{ data: unknown[]; meta: { total: number } }>('/results', { params: { status: 'PUBLISHED', limit: 1 } }).catch(() => ({ data: { data: [], meta: { total: 0 } } }))).data.meta.total,
  });

  const auditsQuery = useQuery({
    queryKey: ['dashboard', 'auditRecent'],
    queryFn: async () =>
      (await api.get<{ data: AuditLog[] }>('/audit', { params: { limit: 10 } }).catch(() => ({ data: { data: [] } }))).data.data,
    enabled: user?.role === 'Principal',
  });

  const teacherAssignmentsQuery = useQuery({
    queryKey: ['dashboard', 'teacherAssignments', user?.id],
    queryFn: async () => (await api.get<{ data: TeacherSubject[] }>(`/teacher-subjects/teacher/${user?.id}`)).data.data,
    enabled: user?.role === 'Teacher' && Boolean(user?.id),
  });

  const chartValues = useMemo(() => [22, 35, 28, 10, 5], []);

  if (!user) {
    return null;
  }

  if (user.role === 'Principal') {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-4'>
          <Card title='Total Students'>{studentsQuery.data ?? 0}</Card>
          <Card title='Total Exams'>{examsQuery.data ?? 0}</Card>
          <Card title='Results Published'>{publishedResultsQuery.data ?? 0}</Card>
          <Card title='Pending Approval'>{reviewExamsQuery.data ?? 0}</Card>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card title='Grade Distribution'>
            <GradeDistributionChart labels={['A+', 'A', 'B', 'C', 'D']} values={chartValues} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f', '#c53030']} />
          </Card>
          <Card title='Pass / Fail'>
            <PassFailChart labels={['Pass', 'Fail', 'Incomplete']} values={[40, 4, 1]} />
          </Card>
        </div>

        <Card title='Recent Audit Logs'>
          <Table
            columns={[
              { key: 'user', label: 'User', render: (row: AuditLog) => row.user?.email || '-' },
              { key: 'action', label: 'Action' },
              { key: 'entity', label: 'Entity' },
              { key: 'createdAt', label: 'Time', render: (row: AuditLog) => new Date(row.createdAt).toLocaleString() },
            ]}
            data={auditsQuery.data || []}
          />
        </Card>
      </div>
    );
  }

  if (user.role === 'ExamDept') {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-3'>
          <Card title='Active Exams'>{examsQuery.data ?? 0}</Card>
          <Card title='Pending Review'>{reviewExamsQuery.data ?? 0}</Card>
          <Card title='Results Ready'>{publishedResultsQuery.data ?? 0}</Card>
        </div>
      </div>
    );
  }

  if (user.role === 'Teacher') {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          <Card title='My Classes'>{teacherAssignmentsQuery.data?.length ?? 0}</Card>
          <Card title='Pending Marks'>{reviewExamsQuery.data ?? 0}</Card>
        </div>
        <Card title='Subject Assignments'>
          <Table
            columns={[
              { key: 'subject', label: 'Subject', render: (row: TeacherSubject) => row.subject?.name || '-' },
              { key: 'class', label: 'Class', render: (row: TeacherSubject) => `${row.class?.name || ''} ${row.class?.section || ''}` },
            ]}
            data={teacherAssignmentsQuery.data || []}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card title='Total Students'>{studentsQuery.data ?? 0}</Card>
        <Card title='Total Classes'>{0}</Card>
        <Card title='Total Teachers'>{0}</Card>
      </div>
      <Card title='Recent Students'>
        <Table
          columns={[
            { key: 'adm_no', label: 'Adm No' },
            { key: 'name', label: 'Name' },
            { key: 'class', label: 'Class', render: (row: Student) => `${row.class?.name || ''} ${row.class?.section || ''}` },
            { key: 'status', label: 'Status', render: () => <Badge status='ACTIVE' label='Active' /> },
          ]}
          data={[]}
        />
      </Card>
    </div>
  );
}
