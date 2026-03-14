'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table, Column } from '@/components/ui/Table'

interface TeacherRow { id: string; employeeId: string; firstName?: string; lastName?: string; designation?: string }
interface Res { data: TeacherRow[]; meta: { page: number; totalPages: number } }

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const teachers = useQuery<{ data: Res }>({ queryKey: ['teachers', page, search], queryFn: async () => (await api.get('/teachers', { params: { page, limit: 10, search } })).data })
  const cols: Column<TeacherRow>[] = [{ key: 'employeeId', label: 'Employee ID' }, { key: 'name', label: 'Name', render: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() }, { key: 'designation', label: 'Designation', render: (r) => r.designation ?? '-' }, { key: 'view', label: 'View', render: (r) => <Link className="text-[#2b6cb0]" href={`/teachers/${r.id}`}>View</Link> }]
  return <Card title="Teachers"><div className="mb-3"><Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /></div><Table columns={cols} data={teachers.data?.data.data ?? []} keyExtractor={(r) => r.id} loading={teachers.isLoading} /><div className="mt-4"><Pagination page={teachers.data?.data.meta.page ?? 1} totalPages={teachers.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div></Card>
}
