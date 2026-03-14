'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table, Column } from '@/components/ui/Table'

interface ExamRow { id: string; name: string; status: string; classId: string; class?: { name: string; section: string }; startDate: string; endDate: string }
interface ClassRow { id: string; name: string; section: string }
const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']

export default function ExamsPage() {
  const [status, setStatus] = useState('ALL')
  const [classId, setClassId] = useState('')
  const exams = useQuery({ queryKey: ['exams', status, classId], queryFn: async () => (await api.get<{ data: ExamRow[] }>('/exams', { params: { status: status === 'ALL' ? undefined : status, classId: classId || undefined } })).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: ClassRow[] }>('/classes')).data })

  const columns: Column<ExamRow>[] = [
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class', render: (row) => row.class ? `${row.class.name} - ${row.class.section}` : '-' },
    { key: 'range', label: 'Date', render: (row) => `${new Date(row.startDate).toLocaleDateString()} - ${new Date(row.endDate).toLocaleDateString()}` },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'open', label: 'Open', render: (row) => <Link href={`/exams/${row.id}`} className="text-[#2b6cb0]">View</Link> },
  ]

  return (
    <Card title="Exams" actions={<Link href="/exams/new" className="rounded-lg bg-[#1a365d] px-3 py-2 text-sm text-white">Create</Link>}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {statuses.map((s) => <button key={s} className={`rounded-md px-3 py-1 text-sm ${s === status ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`} onClick={() => setStatus(s)}>{s}</button>)}
        <select className="rounded-lg border px-3 py-1.5" value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All Classes</option>
          {(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
        </select>
      </div>
      <Table columns={columns} data={exams.data?.data ?? []} keyExtractor={(row) => row.id} loading={exams.isLoading} />
    </Card>
  )
}
