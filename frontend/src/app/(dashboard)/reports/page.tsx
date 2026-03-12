'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'
import { PassFailChart } from '@/components/charts/PassFailChart'
import { TopPerformersChart } from '@/components/charts/TopPerformersChart'

export default function ReportsPage() {
  const [examId, setExamId] = useState('')
  const exams = useQuery({ queryKey: ['exams', 'reports'], queryFn: async () => (await api.get('/exams')).data })
  const charts = useQuery({ queryKey: ['reports-charts', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data, enabled: Boolean(examId) })

  const data = charts.data?.data

  const download = async (path: string, filename: string) => {
    const response = await api.get(path, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-4'>
      <Card title='Reports'>
        <select className='rounded border px-3 py-2' value={examId} onChange={(event) => setExamId(event.target.value)}>
          <option value=''>Select exam</option>
          {(exams.data?.data?.data as Array<{ id: string; name: string }> | undefined)?.map((exam) => (
            <option key={exam.id} value={exam.id}>{exam.name}</option>
          ))}
        </select>
      </Card>

      {examId ? (
        <div className='grid gap-4 md:grid-cols-2'>
          <Card title='Grade Distribution'>
            <GradeDistributionChart labels={(data?.gradeDistribution ?? []).map((item: { label: string }) => item.label)} values={(data?.gradeDistribution ?? []).map((item: { value: number }) => item.value)} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f']} />
          </Card>
          <Card title='Subject Averages'>
            <SubjectAveragesChart labels={(data?.subjectAverages ?? []).map((item: { label: string }) => item.label)} values={(data?.subjectAverages ?? []).map((item: { value: number }) => item.value)} />
          </Card>
          <Card title='Pass / Fail'>
            <PassFailChart labels={(data?.passFailDistribution ?? []).map((item: { label: string }) => item.label)} values={(data?.passFailDistribution ?? []).map((item: { value: number }) => item.value)} />
          </Card>
          <Card title='Top Performers'>
            <TopPerformersChart labels={(data?.topPerformers ?? []).map((item: { label: string }) => item.label)} values={(data?.topPerformers ?? []).map((item: { value: number }) => item.value)} />
          </Card>
        </div>
      ) : null}

      {examId ? (
        <Card title='Downloads'>
          <div className='flex flex-wrap gap-2'>
            <Button onClick={() => void download(`/reports/report-cards-zip/${examId}`, `report-cards-${examId}.zip`)}>Download All Report Cards ZIP</Button>
            <Button variant='secondary' onClick={() => void download(`/reports/class-report/${examId}`, `class-report-${examId}.pdf`)}>Download Class Report PDF</Button>
            <Button variant='secondary' onClick={() => void download(`/reports/marksheet/${examId}`, `marksheet-${examId}.pdf`)}>Download Marksheet PDF</Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
