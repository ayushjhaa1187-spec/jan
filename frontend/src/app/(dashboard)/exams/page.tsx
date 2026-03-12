'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useExams } from '@/hooks/useExams'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']

export default function ExamsPage() {
  const [status, setStatus] = useState('ALL')
  const [classId, setClassId] = useState('')

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const exams = useExams({ status: status === 'ALL' ? undefined : status, classId: classId || undefined, page: 1, limit: 50 })

  return (
    <Card title='Exams' actions={<Link className='rounded bg-[#1a365d] px-3 py-2 text-sm text-white' href='/exams/new'>Create Exam</Link>}>
      <div className='mb-4 flex flex-wrap gap-2'>
        {statuses.map((item) => (
          <button key={item} className={`rounded px-3 py-1 text-sm ${status === item ? 'bg-[#1a365d] text-white' : 'bg-slate-100'}`} onClick={() => setStatus(item)}>{item}</button>
        ))}
        <select className='rounded border px-3 py-1 text-sm' value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value=''>All classes</option>
          {(classes.data?.data as Array<{ id: string; name: string; section: string }> | undefined)?.map((item) => (
            <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
          ))}
        </select>
      </div>
      <Table
        columns={[
          { key: 'name', label: 'Name', render: (row) => <Link className='text-[#2b6cb0]' href={`/exams/${(row as { id: string }).id}`}>{(row as { name: string }).name}</Link> },
          { key: 'class', label: 'Class', render: (row) => `${(row as { class?: { name: string; section: string } }).class?.name || '-'} ${(row as { class?: { name: string; section: string } }).class?.section || ''}` },
          { key: 'dates', label: 'Dates', render: (row) => `${new Date((row as { startDate: string }).startDate).toLocaleDateString()} - ${new Date((row as { endDate: string }).endDate).toLocaleDateString()}` },
          { key: 'status', label: 'Status', render: (row) => <Badge status={(row as { status: string }).status} /> },
        ]}
        data={exams.data?.data?.data ?? []}
        loading={exams.isLoading}
      />
    </Card>
  )
}
