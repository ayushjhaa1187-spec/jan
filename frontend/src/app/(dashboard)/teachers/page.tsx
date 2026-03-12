'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const teachers = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: async () => (await api.get('/teachers', { params: { page, limit: 20, search } })).data,
  })

  return (
    <Card title='Teachers'>
      <div className='mb-4'>
        <Input placeholder='Search teachers...' value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <Table
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name', render: (row) => `${(row as { firstName: string }).firstName} ${(row as { lastName: string }).lastName}` },
          { key: 'designation', label: 'Designation', render: () => '-' },
          { key: 'subjects', label: 'Subjects', render: (row) => String((row as { subjects?: unknown[] }).subjects?.length || 0) },
          { key: 'actions', label: 'Actions', render: (row) => <Link className='text-[#2b6cb0]' href={`/teachers/${(row as { id: string }).id}`}>View</Link> },
        ]}
        data={teachers.data?.data?.data ?? []}
        loading={teachers.isLoading}
      />
      <div className='mt-4'>
        <Pagination page={page} totalPages={teachers.data?.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
      </div>
    </Card>
  )
}
