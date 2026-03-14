'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'

interface ExamRow { id: string; name: string }

export default function ResultsPage() {
  const router = useRouter()
  const exams = useQuery<{ data: ExamRow[] }>({ queryKey: ['results-exams'], queryFn: async () => (await api.get('/exams', { params: { status: 'PUBLISHED' } })).data })
  return <Card title="Results"><select className="w-full rounded border px-3 py-2" onChange={(e) => e.target.value && router.push(`/results/${e.target.value}`)}><option value="">Select an exam</option>{(exams.data?.data ?? []).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Card>
}
