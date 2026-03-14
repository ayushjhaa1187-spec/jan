'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'

export default function ResultsPage() {
  const router = useRouter()
  const exams = useQuery({ queryKey: ['exams-select'], queryFn: async () => (await api.get('/exams', { params: { limit: 200 } })).data })
  const rows: Array<{ id: string; name: string }> = exams.data?.data ?? []

  return <Card title="Results"><label className="block text-sm font-medium">Select exam<select className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => e.target.value && router.push(`/results/${e.target.value}`)}><option value="">Choose an exam</option>{rows.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label></Card>
}
