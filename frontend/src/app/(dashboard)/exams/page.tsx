'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

interface ExamRow { id: string; name: string; status: string; startDate: string; endDate: string; class?: { id: string; name: string; section: string } }
interface ExamResponse { data: { data: ExamRow[] } }
interface ClassesResponse { data: Array<{ id: string; name: string; section: string }> }

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const

export default function ExamsPage() {
  const [status, setStatus] = useState<(typeof statuses)[number]>('ALL')
  const [classId, setClassId] = useState('')

  const exams = useQuery<ExamResponse>({ queryKey: ['exams', status, classId], queryFn: async () => (await api.get('/exams', { params: { status: status === 'ALL' ? undefined : status, classId: classId || undefined } })).data })
  const classes = useQuery<ClassesResponse>({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })

  return (
    <Card title="Exams" actions={<Link href='/exams/new' className='rounded-lg bg-[#1a365d] px-4 py-2 text-sm text-white'>Create</Link>}>
      <div className='mb-4 flex flex-wrap gap-2'>
        {statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-lg px-3 py-1.5 text-sm ${status === item ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`}>{item}</button>)}
        <select className='rounded-lg border px-3 py-1.5 text-sm' value={classId} onChange={(event) => setClassId(event.target.value)}><option value=''>All Classes</option>{(classes.data?.data ?? []).map((row) => <option key={row.id} value={row.id}>{row.name} - {row.section}</option>)}</select>
      </div>
      <div className='overflow-x-auto rounded-xl border border-gray-200'>
        <table className='min-w-full'>
          <thead className='bg-[#1a365d] text-white'><tr><th className='px-4 py-3 text-left text-xs'>Name</th><th className='px-4 py-3 text-left text-xs'>Class</th><th className='px-4 py-3 text-left text-xs'>Start</th><th className='px-4 py-3 text-left text-xs'>End</th><th className='px-4 py-3 text-left text-xs'>Status</th></tr></thead>
          <tbody>{(exams.data?.data.data ?? []).map((exam, index) => <tr key={exam.id} onClick={() => window.location.href = `/exams/${exam.id}`} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer`}><td className='px-4 py-3'>{exam.name}</td><td className='px-4 py-3'>{exam.class?.name} {exam.class?.section}</td><td className='px-4 py-3'>{new Date(exam.startDate).toLocaleDateString()}</td><td className='px-4 py-3'>{new Date(exam.endDate).toLocaleDateString()}</td><td className='px-4 py-3'><Badge status={exam.status} /></td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  )
}
