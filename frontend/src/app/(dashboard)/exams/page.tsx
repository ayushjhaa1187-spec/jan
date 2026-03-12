'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { useExams } from '@/hooks/useExams';
import { Class, Exam } from '@/types';
import { formatDate } from '@/lib/utils';

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'];

export default function ExamsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('ALL');
  const [classId, setClassId] = useState('');

  const examsQuery = useExams({
    page,
    limit: 20,
    status: status === 'ALL' ? undefined : status,
    classId: classId || undefined,
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data,
  });

  return (
    <Card title='Exams' actions={<Link href='/exams/new' className='rounded bg-primary px-3 py-2 text-sm text-white'>Create Exam</Link>}>
      <div className='mb-4 flex flex-wrap gap-2'>
        {statuses.map((item) => (
          <button
            key={item}
            type='button'
            onClick={() => setStatus(item)}
            className={`rounded px-3 py-1 text-sm ${status === item ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {item}
          </button>
        ))}
        <select className='h-9 rounded border border-slate-300 px-2 text-sm' value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value=''>All classes</option>
          {(classesQuery.data || []).map((item) => (
            <option key={item.id} value={item.id}>{item.name} {item.section}</option>
          ))}
        </select>
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Name', render: (row: Exam) => <Link href={`/exams/${row.id}`} className='text-primary-light'>{row.name}</Link> },
          { key: 'class', label: 'Class', render: (row: Exam) => `${row.class?.name || ''} ${row.class?.section || ''}` },
          { key: 'dates', label: 'Dates', render: (row: Exam) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
          { key: 'status', label: 'Status', render: (row: Exam) => <Badge status={row.status} /> },
          { key: 'actions', label: 'Actions', render: (row: Exam) => <Link href={`/exams/${row.id}`} className='text-primary-light'>Open</Link> },
        ]}
        data={examsQuery.data?.data || []}
      />

      <div className='mt-4'>
        <Pagination page={page} totalPages={examsQuery.data?.meta.totalPages || 1} onPageChange={setPage} />
      </div>
    </Card>
  );
}
