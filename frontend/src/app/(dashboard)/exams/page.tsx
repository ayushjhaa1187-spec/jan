'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { useExams } from '@/hooks/useExams';
import { formatDate } from '@/lib/utils';

const tabs = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'];

export default function ExamsPage() {
  const [status, setStatus] = useState('ALL');
  const [classId, setClassId] = useState('');

  const exams = useExams({ status: status === 'ALL' ? undefined : status, classId: classId || undefined });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Exams</h1>
        <Link href='/exams/new'><Button>Create Exam</Button></Link>
      </div>

      <div className='flex flex-wrap gap-2'>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-3 py-2 rounded border ${status === tab ? 'bg-[#1a365d] text-white' : 'bg-white'}`}
            onClick={() => setStatus(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        <input className='rounded-md border px-3 py-2' placeholder='Class ID filter' value={classId} onChange={(event) => setClassId(event.target.value)} />
      </div>

      <Table
        loading={exams.isLoading}
        columns={[
          { key: 'name', label: 'Name', render: (row: { id: string; name: string }) => <Link href={`/exams/${row.id}`} className='text-blue-700'>{row.name}</Link> },
          { key: 'class', label: 'Class', render: (row: { class?: { name?: string; section?: string } }) => `${row.class?.name ?? '-'}-${row.class?.section ?? '-'}` },
          { key: 'dates', label: 'Dates', render: (row: { startDate: string; endDate: string }) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}` },
          { key: 'status', label: 'Status', render: (row: { status: string }) => <Badge status={row.status} /> },
          { key: 'actions', label: 'Actions', render: (row: { id: string }) => <Link href={`/exams/${row.id}`} className='text-blue-700'>Open</Link> },
        ]}
        data={exams.data?.data ?? []}
      />
    </div>
  );
}
