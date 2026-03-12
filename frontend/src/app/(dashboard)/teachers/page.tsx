'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';

export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const teachers = useQuery({ queryKey: ['teachers', page, search], queryFn: async () => (await api.get('/teachers', { params: { page, limit: 20, search } })).data.data });

  return (
    <div className='space-y-4'>
      <Input label='Search teachers' value={search} onChange={(event) => setSearch(event.target.value)} />
      <Table
        loading={teachers.isLoading}
        data={teachers.data?.data ?? []}
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name', render: (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || row.user?.name || '-' },
          { key: 'designation', label: 'Designation', render: (row) => row.designation ?? '-' },
          { key: 'subjects', label: 'Subjects', render: (row) => String(row.subjects?.length ?? 0) },
          { key: 'actions', label: 'Actions', render: (row) => <Link className='text-[#1a365d]' href={`/teachers/${row.id}`}>View</Link> },
        ]}
      />
      <Pagination page={teachers.data?.meta?.page ?? 1} totalPages={teachers.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
