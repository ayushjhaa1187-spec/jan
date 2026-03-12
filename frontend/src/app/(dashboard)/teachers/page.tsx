'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const teachers = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: async () => (await api.get('/teachers', { params: { page, limit: 20, search } })).data,
  });

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>Teachers</h1>
      <Input placeholder='Search teachers' value={search} onChange={(event) => setSearch(event.target.value)} />
      <Table
        loading={teachers.isLoading}
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name', render: (row: { firstName?: string; lastName?: string; user?: { email: string } }) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || row.user?.email || '-' },
          { key: 'designation', label: 'Designation', render: () => '-' },
          { key: 'subjects', label: 'Subjects', render: () => '-' },
          { key: 'actions', label: 'Actions', render: (row: { id: string }) => <Link className='text-blue-700' href={`/teachers/${row.id}`}>View</Link> },
        ]}
        data={teachers.data?.data ?? []}
      />
      <Pagination page={teachers.data?.meta?.page ?? page} totalPages={teachers.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
