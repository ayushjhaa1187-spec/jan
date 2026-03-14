'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'

type Status = 'ALL' | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'
interface ExamRow { id: string; name: string; status: string; class?: { id: string; name: string; section: string }; startDate: string; endDate: string }
interface ClassRow { id: string; name: string; section: string }

export default function ExamsPage() {
  const [status, setStatus] = useState<Status>('ALL')
  const [classId, setClassId] = useState('')
  const exams = useQuery<{ data: ExamRow[] }>({ queryKey: ['exams', status, classId], queryFn: async () => (await api.get('/exams', { params: { status: status === 'ALL' ? undefined : status, classId: classId || undefined } })).data })
  const classes = useQuery<{ data: ClassRow[] }>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const cols: Column<ExamRow>[] = [{ key: 'name', label: 'Name', render: (r) => <Link className="text-[#2b6cb0]" href={`/exams/${r.id}`}>{r.name}</Link> }, { key: 'class', label: 'Class', render: (r) => `${r.class?.name ?? '-'} ${r.class?.section ?? ''}` }, { key: 'start', label: 'Start', render: (r) => new Date(r.startDate).toLocaleDateString() }, { key: 'end', label: 'End', render: (r) => new Date(r.endDate).toLocaleDateString() }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }]
  return <Card title="Exams" actions={<Link className="rounded bg-[#1a365d] text-white px-3 py-2 text-sm" href="/exams/new">Create</Link>}><div className="mb-3 flex flex-wrap gap-2">{(['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as Status[]).map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded px-3 py-1 text-sm ${status === s ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`}>{s}</button>)}<select className="rounded border px-3 py-1" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">All Classes</option>{(classes.data?.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}</select></div><Table columns={cols} data={exams.data?.data ?? []} keyExtractor={(r) => r.id} loading={exams.isLoading} /></Card>
}
