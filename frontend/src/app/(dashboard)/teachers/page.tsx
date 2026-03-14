'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'

interface TeacherRow { id: string; employeeId: string; designation?: string; user?: { name: string } }
interface TeachersResponse { data: { data: TeacherRow[]; meta: { page: number; totalPages: number } } }

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const teachers = useQuery<TeachersResponse>({
    queryKey: ['teachers', page, search],
    queryFn: async () => (await api.get('/teachers', { params: { page, limit: 10, search } })).data,
  })

  return (
    <Card title='Teachers'>
      <div className='mb-4'>
        <Input placeholder='Search teachers...' value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <Table
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name', render: (row: TeacherRow) => row.user?.name ?? '-' },
          { key: 'designation', label: 'Designation', render: (row: TeacherRow) => row.designation ?? '-' },
          { key: 'actions', label: 'Actions', render: (row: TeacherRow) => <Link className='text-[#2b6cb0]' href={`/teachers/${row.id}`}>View</Link> },
        ]}
        data={teachers.data?.data.data ?? []}
        loading={teachers.isLoading}
        keyExtractor={(row) => row.id}
      />
      <div className='mt-4'>
        <Pagination page={teachers.data?.data.meta.page ?? 1} totalPages={teachers.data?.data.meta.totalPages ?? 1} onPageChange={setPage} />
      </div>
    </Card>
  )
}
