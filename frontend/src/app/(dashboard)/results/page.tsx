'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

export default function ResultsPage() {
  const router = useRouter()
  const exams = useQuery({ queryKey: ['exams', 'results-page'], queryFn: async () => (await api.get('/exams')).data })

  return (
    <Card title='Results'>
      <Table
        columns={[
          { key: 'name', label: 'Exam' },
          { key: 'class', label: 'Class', render: (row) => `${(row as { class?: { name: string; section: string } }).class?.name || '-'} ${(row as { class?: { name: string; section: string } }).class?.section || ''}` },
          { key: 'action', label: 'Action', render: (row) => <button className='text-[#2b6cb0]' onClick={() => router.push(`/results/${(row as { id: string }).id}`)}>View Results</button> },
        ]}
        data={exams.data?.data?.data ?? []}
        loading={exams.isLoading}
      />
    </Card>
  )
}
