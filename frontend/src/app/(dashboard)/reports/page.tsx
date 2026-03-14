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
import type { ChartData } from '@/types'

interface ExamRow { id: string; name: string }

export default function ReportsPage() {
  const [examId, setExamId] = useState('')
  const exams = useQuery({ queryKey: ['exams', 'reports'], queryFn: async () => (await api.get<{ data: ExamRow[] }>('/exams')).data })
  const charts = useQuery({ queryKey: ['report-charts', examId], enabled: Boolean(examId), queryFn: async () => (await api.get<{ data: ChartData }>(`/reports/charts/${examId}`)).data })

  const download = async (path: string, filename: string) => {
    const response = await api.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const data = charts.data?.data

  return (
    <div className="space-y-4">
      <Card title="Reports">
        <select className="w-full max-w-md rounded border px-3 py-2" value={examId} onChange={(e) => setExamId(e.target.value)}>
          <option value="">Select exam</option>
          {(exams.data?.data ?? []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </Card>

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Grade Distribution"><GradeDistributionChart labels={data.gradeDistribution.labels} values={data.gradeDistribution.values} colors={data.gradeDistribution.colors} /></Card>
            <Card title="Subject Averages"><SubjectAveragesChart labels={data.subjectAverages.labels} values={data.subjectAverages.values} /></Card>
            <Card title="Pass / Fail"><PassFailChart labels={data.passFailDistribution.labels} values={data.passFailDistribution.values} colors={data.passFailDistribution.colors} /></Card>
            <Card title="Top Performers"><TopPerformersChart labels={data.topPerformers.labels} values={data.topPerformers.values} /></Card>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void download(`/reports/${examId}/zip`, 'all-report-cards.zip')}>ZIP All Report Cards</Button>
            <Button variant="secondary" onClick={() => void download(`/reports/${examId}/class-report`, 'class-report.pdf')}>Class Report PDF</Button>
            <Button variant="secondary" onClick={() => void download(`/reports/${examId}/marksheet`, 'marksheet.pdf')}>Marksheet PDF</Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
