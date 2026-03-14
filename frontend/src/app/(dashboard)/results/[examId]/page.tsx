'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Column } from '@/components/ui/Table'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'

interface StudentResult { studentId: string; name: string; adm_no: string; percentage: number; grade: string; status: string; rank: number }
interface Summary { total: number; passed: number; failed: number; incomplete: number; average: number; gradeDistribution: { labels: string[]; values: number[] } }
interface ResultsResponse { data: { summary: Summary; rows: StudentResult[] } }

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>()
  const role = useAuthStore((state) => state.user?.role)
  const result = useQuery({ queryKey: ['results', examId], queryFn: async () => (await api.get<ResultsResponse>(`/results/${examId}`)).data })
  const generate = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/generate`)).data })
  const publish = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/publish`)).data })

  const rows = result.data?.data.rows ?? []
  const summary = result.data?.data.summary
  const columns: Column<StudentResult>[] = [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Name' },
    { key: 'adm_no', label: 'Adm No' },
    { key: 'percentage', label: '%', render: (row) => `${row.percentage}%` },
    { key: 'grade', label: 'Grade' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'view', label: 'View', render: (row) => <Link className="text-[#2b6cb0]" href={`/results/${examId}/${row.studentId}`}>View</Link> },
  ]

  const blobDownload = async (path: string, filename: string) => {
    const response = await api.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-5">
        <StatCard title="Total" value={summary?.total ?? 0} />
        <StatCard title="Passed" value={summary?.passed ?? 0} />
        <StatCard title="Failed" value={summary?.failed ?? 0} />
        <StatCard title="Incomplete" value={summary?.incomplete ?? 0} />
        <StatCard title="Average" value={`${summary?.average ?? 0}%`} />
      </div>
      <Card title="Grade Distribution"><SubjectAveragesChart labels={summary?.gradeDistribution.labels ?? []} values={summary?.gradeDistribution.values ?? []} /></Card>
      <Card title="Ranked Students" actions={<div className="flex gap-2">{role === 'ExamDept' ? <Button size="sm" onClick={() => void generate.mutateAsync().then(() => toast.success('Results generated'))}>Generate Results</Button> : null}{role === 'Principal' ? <Button size="sm" onClick={() => { if ((summary?.incomplete ?? 0) > 0) { toast.error('Some results are incomplete') } else { void publish.mutateAsync().then(() => toast.success('Results published')) } }}>Publish Results</Button> : null}</div>}>
        <Table columns={columns} data={rows} keyExtractor={(row) => row.studentId} loading={result.isLoading} />
      </Card>
      <div className="flex gap-2"><Button variant="secondary" onClick={() => void blobDownload(`/results/${examId}/class-report`, 'class-report.pdf')}>Download Class Report</Button><Button variant="secondary" onClick={() => void blobDownload(`/results/${examId}/marksheet`, 'marksheet.pdf')}>Download Marksheet PDF</Button></div>
    </div>
  )
}
