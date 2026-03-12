'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Teacher } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const teachersQuery = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: async () =>
      (await api.get<{ data: Teacher[]; meta: { totalPages: number } }>('/teachers', { params: { page, limit: 20, search } })).data,
  });

  return (
    <Card title='Teachers'>
      <div className='mb-4 max-w-sm'>
        <Input label='Search' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search teacher' />
      </div>
      <Table
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name', render: (row: Teacher) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.user.email },
          { key: 'designation', label: 'Designation', render: (row: Teacher) => row.designation || '-' },
          { key: 'subjects', label: 'Subjects', render: () => '-' },
          { key: 'actions', label: 'Actions', render: (row: Teacher) => <Link href={`/teachers/${row.id}`} className='text-primary-light'>View</Link> },
        ]}
        data={teachersQuery.data?.data || []}
      />
      <div className='mt-4'>
        <Pagination page={page} totalPages={teachersQuery.data?.meta.totalPages || 1} onPageChange={setPage} />
      </div>
    </Card>
  );
}
