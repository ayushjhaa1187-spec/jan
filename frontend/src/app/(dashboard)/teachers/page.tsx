'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table, Column } from '@/components/ui/Table'

interface TeacherRow { id: string; employeeId: string; designation?: string; user?: { name: string } }
interface TeacherListResponse { data: TeacherRow[]; meta: { totalPages: number } }

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const teachers = useQuery({ queryKey: ['teachers', page, search], queryFn: async () => (await api.get<TeacherListResponse>('/teachers', { params: { page, limit: 10, search } })).data })

  const columns: Column<TeacherRow>[] = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'name', label: 'Name', render: (row) => row.user?.name ?? '-' },
    { key: 'designation', label: 'Designation', render: (row) => row.designation ?? '-' },
    { key: 'view', label: 'View', render: (row) => <Link className="text-[#2b6cb0]" href={`/teachers/${row.id}`}>View</Link> },
  ]

  return (
    <Card title="Teachers">
      <div className="mb-4"><Input placeholder="Search teachers" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <Table columns={columns} data={teachers.data?.data ?? []} keyExtractor={(row) => row.id} loading={teachers.isLoading} />
      <div className="mt-4"><Pagination page={page} totalPages={teachers.data?.meta.totalPages ?? 1} onPageChange={setPage} /></div>
    </Card>
  )
}
