'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { useExams } from '@/hooks/useExams';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const;

export default function ExamsPage() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('ALL');
  const [classId, setClassId] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });
  const exams = useExams({ page, limit: 20, classId: classId || undefined, status: status === 'ALL' ? undefined : status, search });

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex flex-wrap gap-2'>
          {statuses.map((item) => (
            <button key={item} className={`rounded px-3 py-1 text-sm ${status === item ? 'bg-[#1a365d] text-white' : 'bg-slate-100 text-slate-700'}`} onClick={() => setStatus(item)}>
              {item}
            </button>
          ))}
        </div>
        <Link href='/exams/new' className='rounded bg-[#1a365d] px-4 py-2 text-white'>Create Exam</Link>
      </div>

      <div className='flex flex-wrap gap-3'>
        <Input label='Search' value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Class</label>
          <select value={classId} onChange={(event) => setClassId(event.target.value)} className='h-10 rounded border border-slate-300 px-3'>
            <option value=''>All classes</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
          </select>
        </div>
      </div>

      <Table
        loading={exams.isLoading}
        data={exams.data?.data ?? []}
        columns={[
          { key: 'name', label: 'Name', render: (row) => <Link href={`/exams/${row.id}`} className='text-[#1a365d]'>{row.name}</Link> },
          { key: 'class', label: 'Class', render: (row) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}` },
          { key: 'dates', label: 'Dates', render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
          { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
          { key: 'actions', label: 'Actions', render: (row) => <Link href={`/exams/${row.id}/marks`} className='text-[#1a365d]'>Enter Marks</Link> },
        ]}
      />

      <Pagination page={exams.data?.meta.page ?? 1} totalPages={exams.data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
