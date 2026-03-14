'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'
import { PassFailChart } from '@/components/charts/PassFailChart'
import { TopPerformersChart } from '@/components/charts/TopPerformersChart'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function ReportsPage() {
  const [examId, setExamId] = useState('')
  const exams = useQuery({ queryKey: ['reports-exams'], queryFn: async () => (await api.get('/exams', { params: { limit: 200 } })).data })
  const charts = useQuery({ queryKey: ['report-charts', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data, enabled: Boolean(examId) })
  const c = charts.data?.data

  return <div className="space-y-4"><Card title="Reports" actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => toast.info('Downloading ZIP all report cards...')}>ZIP Report Cards</Button><Button variant="secondary" onClick={() => toast.info('Downloading class report PDF...')}>Class Report PDF</Button><Button variant="secondary" onClick={() => toast.info('Downloading marksheet PDF...')}>Marksheet PDF</Button></div>}>
    <label className="block text-sm font-medium">Exam<select className="mt-1 w-full rounded border px-3 py-2" value={examId} onChange={(e) => setExamId(e.target.value)}><option value="">Select exam</option>{(exams.data?.data ?? []).map((e: { id: string; name: string }) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
  </Card>
  <div className="grid md:grid-cols-2 gap-4"><Card title="Grade Distribution"><GradeDistributionChart labels={c?.gradeDistribution?.labels} values={c?.gradeDistribution?.values} colors={c?.gradeDistribution?.colors} /></Card><Card title="Subject Averages"><SubjectAveragesChart labels={c?.subjectAverages?.labels} values={c?.subjectAverages?.values} /></Card><Card title="Pass / Fail"><PassFailChart labels={c?.passFailDistribution?.labels} values={c?.passFailDistribution?.values} colors={c?.passFailDistribution?.colors} /></Card><Card title="Top Performers"><TopPerformersChart labels={c?.topPerformers?.labels} values={c?.topPerformers?.values} /></Card></div></div>
}
