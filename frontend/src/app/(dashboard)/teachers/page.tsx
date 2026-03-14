'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table, Column } from '@/components/ui/Table'

interface TeacherRow {
  id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  subjects?: Array<{ id: string }>;
}

interface TeachersResponse {
  data: {
    data: TeacherRow[];
    meta?: {
      page?: number;
      totalPages?: number;
    };
  };
}

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const teachers = useQuery<TeachersResponse>({
    queryKey: ['teachers', page, search],
    queryFn: async () => (await api.get('/teachers', { params: { page, limit: 10, search } })).data,
  })

  const columns = useMemo<Column<TeacherRow>[]>(
    () => [
      { key: 'employeeId', label: 'Employee ID' },
      {
        key: 'name',
        label: 'Name',
        render: (row) => `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'No Name',
      },
      {
        key: 'subjects',
        label: 'Subjects Taught',
        render: (row) => String(row.subjects?.length ?? 0),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <Link className="text-[#2b6cb0] hover:underline font-medium" href={`/teachers/${row.id}`}>
            View Profile
          </Link>
        ),
      },
    ],
    []
  )

  return (
    <Card title="Teacher Directory">
      <div className="mb-6">
        <Input
          placeholder="Search by name or employee ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="bg-white rounded-lg border">
        <Table
          columns={columns}
          data={teachers.data?.data.data ?? []}
          loading={teachers.isLoading}
          keyExtractor={(row) => row.id}
        />
      </div>
      
      <div className="mt-6 flex justify-end">
        <Pagination
          page={page}
          totalPages={teachers.data?.data.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </Card>
  )
}
