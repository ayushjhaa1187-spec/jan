'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'

interface ExamRow { id: string; name: string }

export default function ResultsPage() {
  const router = useRouter()
  const exams = useQuery({ queryKey: ['exams', 'list'], queryFn: async () => (await api.get<{ data: ExamRow[] }>('/exams')).data })

  return (
    <Card title="Results">
      <select className="w-full max-w-md rounded-lg border px-3 py-2" onChange={(e) => e.target.value ? router.push(`/results/${e.target.value}`) : undefined}>
        <option value="">Select exam</option>
        {(exams.data?.data ?? []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
      </select>
    </Card>
  )
}
