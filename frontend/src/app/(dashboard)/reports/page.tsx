'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'
import { PassFailChart } from '@/components/charts/PassFailChart'
import { TopPerformersChart } from '@/components/charts/TopPerformersChart'
import { Button } from '@/components/ui/Button'
import type { ChartData } from '@/types'

interface ExamRow { id: string; name: string }

function downloadBlob(url: string, fileName: string) {
  api.get(url, { responseType: 'blob' }).then((response) => {
    const objectUrl = URL.createObjectURL(response.data)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(objectUrl)
  })
}

export default function ReportsPage() {
  const [examId, setExamId] = useState('')
  const exams = useQuery<{ data: ExamRow[] }>({ queryKey: ['report-exams'], queryFn: async () => (await api.get('/exams')).data })
  const charts = useQuery<{ data: ChartData }>({ queryKey: ['charts', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data, enabled: Boolean(examId) })

  return <div className="space-y-4"><Card title="Reports"><select className="w-full rounded border px-3 py-2" value={examId} onChange={(event) => setExamId(event.target.value)}><option value="">Select exam</option>{(exams.data?.data ?? []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}</select></Card>{examId ? <div className="grid gap-4 md:grid-cols-2"><Card title="Grade Distribution"><GradeDistributionChart labels={charts.data?.data.gradeDistribution.labels ?? []} values={charts.data?.data.gradeDistribution.values ?? []} colors={charts.data?.data.gradeDistribution.colors ?? []} /></Card><Card title="Subject Averages"><SubjectAveragesChart labels={charts.data?.data.subjectAverages.labels ?? []} values={charts.data?.data.subjectAverages.values ?? []} /></Card><Card title="Pass / Fail"><PassFailChart labels={charts.data?.data.passFailDistribution.labels ?? []} values={charts.data?.data.passFailDistribution.values ?? []} colors={charts.data?.data.passFailDistribution.colors ?? []} /></Card><Card title="Top Performers"><TopPerformersChart labels={charts.data?.data.topPerformers.labels ?? []} values={charts.data?.data.topPerformers.values ?? []} /></Card></div> : null}<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => downloadBlob(`/reports/${examId}/report-cards.zip`, `report-cards-${examId}.zip`)} disabled={!examId}>ZIP all report cards</Button><Button variant="secondary" onClick={() => downloadBlob(`/results/${examId}/class-report`, `class-report-${examId}.pdf`)} disabled={!examId}>Class Report PDF</Button><Button variant="secondary" onClick={() => downloadBlob(`/results/${examId}/marksheet`, `marksheet-${examId}.pdf`)} disabled={!examId}>Marksheet PDF</Button></div></div>
}
