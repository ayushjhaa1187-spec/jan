'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'
import { PassFailChart } from '@/components/charts/PassFailChart'
import { TopPerformersChart } from '@/components/charts/TopPerformersChart'

interface ExamsResponse { data: Array<{ id: string; name: string }> }
interface ChartResponse {
  data: {
    gradeDistribution: { labels: string[]; values: number[]; colors: string[] }
    subjectAverages: { labels: string[]; values: number[] }
    passFailDistribution: { labels: string[]; values: number[]; colors: string[] }
    topPerformers: { labels: string[]; values: number[] }
  }
}

export default function ReportsPage() {
  const [examId, setExamId] = useState('')

  const exams = useQuery<ExamsResponse>({ queryKey: ['reports', 'exams'], queryFn: async () => (await api.get('/exams', { params: { limit: 100 } })).data })
  const charts = useQuery<ChartResponse>({ queryKey: ['reports', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data, enabled: Boolean(examId) })

  const download = async (url: string, filename: string) => {
    const response = await api.get(url, { responseType: 'blob' })
    const blobUrl = URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className='space-y-4'>
      <Card title='Reports'>
        <select className='w-full rounded-lg border px-3 py-2 md:w-80' value={examId} onChange={(event) => setExamId(event.target.value)}>
          <option value=''>Select Exam</option>
          {(exams.data?.data ?? []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </Card>

      {examId && charts.data && (
        <>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card title='Grade Distribution'><GradeDistributionChart labels={charts.data.data.gradeDistribution.labels} values={charts.data.data.gradeDistribution.values} colors={charts.data.data.gradeDistribution.colors} /></Card>
            <Card title='Subject Averages'><SubjectAveragesChart labels={charts.data.data.subjectAverages.labels} values={charts.data.data.subjectAverages.values} /></Card>
            <Card title='Pass vs Fail'><PassFailChart labels={charts.data.data.passFailDistribution.labels} values={charts.data.data.passFailDistribution.values} colors={charts.data.data.passFailDistribution.colors} /></Card>
            <Card title='Top Performers'><TopPerformersChart labels={charts.data.data.topPerformers.labels} values={charts.data.data.topPerformers.values} /></Card>
          </div>
          <Card title='Downloads'>
            <div className='flex flex-wrap gap-2'>
              <Button variant='secondary' onClick={() => void download(`/reports/${examId}/zip`, 'report-cards.zip')}>ZIP All Report Cards</Button>
              <Button variant='secondary' onClick={() => void download(`/reports/${examId}/class-report`, 'class-report.pdf')}>Class Report PDF</Button>
              <Button variant='secondary' onClick={() => void download(`/reports/${examId}/marksheet`, 'marksheet.pdf')}>Marksheet PDF</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
