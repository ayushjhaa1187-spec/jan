'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ExamsResponse { data: Array<{ id: string; name: string }> }

export default function ResultsPage() {
  const [examId, setExamId] = useState('')
  const router = useRouter()
  const exams = useQuery<ExamsResponse>({ queryKey: ['results', 'exams'], queryFn: async () => (await api.get('/exams', { params: { limit: 100 } })).data })

  return (
    <Card title='Results'>
      <div className='flex flex-wrap items-center gap-3'>
        <select className='rounded-lg border px-3 py-2' value={examId} onChange={(event) => setExamId(event.target.value)}>
          <option value=''>Select exam</option>
          {(exams.data?.data ?? []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
        <Button onClick={() => examId && router.push(`/results/${examId}`)}>Open Results</Button>
      </div>
    </Card>
  )
}
