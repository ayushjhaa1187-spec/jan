'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useExams } from '@/hooks/useExams'
import { Badge } from '@/components/ui/Badge'

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const

export default function ExamsPage() {
  const router = useRouter()
  const [status, setStatus] = useState<(typeof statuses)[number]>('ALL')
  const [classId, setClassId] = useState('')
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const { data } = useExams({ status: status === 'ALL' ? undefined : status, classId })
  const rows: Array<{ id: string; name: string; class?: { name: string; section?: string }; startDate: string; endDate: string; status: string }> = data?.data ?? []

  return <div className="space-y-4"><div className="flex justify-between"><h1 className="text-2xl font-bold">Exams</h1><Link href="/exams/new" className="bg-[#2b6cb0] text-white px-3 py-2 rounded">Create</Link></div>
    <div className="flex flex-wrap gap-2">{statuses.map((s) => <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 rounded ${s === status ? 'bg-[#1a365d] text-white' : 'bg-gray-200'}`}>{s}</button>)}<select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded border px-3 py-1"><option value="">All classes</option>{(classes.data?.data ?? []).map((c: { id: string; name: string; section: string }) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}</select></div>
    <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full"><thead><tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Class</th><th className="p-2 text-left">Start</th><th className="p-2 text-left">End</th><th className="p-2 text-left">Status</th></tr></thead><tbody>{rows.map((e) => <tr className="cursor-pointer hover:bg-gray-50" key={e.id} onClick={() => router.push(`/exams/${e.id}`)}><td className="p-2">{e.name}</td><td className="p-2">{e.class?.name}{e.class?.section ? ` - ${e.class.section}` : ''}</td><td className="p-2">{new Date(e.startDate).toLocaleDateString()}</td><td className="p-2">{new Date(e.endDate).toLocaleDateString()}</td><td className="p-2"><Badge status={e.status} /></td></tr>)}</tbody></table></div></div>
}
