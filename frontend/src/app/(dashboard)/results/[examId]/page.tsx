'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card, StatCard } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'

interface Row { id: string; rank: number; name: string; adm_no: string; percentage: number; grade: string; status: string }
interface Summary { total: number; passed: number; failed: number; incomplete: number; averagePercent: number }

function downloadBlob(url: string, filename: string) {
  api.get(url, { responseType: 'blob' }).then((res) => {
    const objectUrl = URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    link.click()
    URL.revokeObjectURL(objectUrl)
  })
}

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>()
  const role = useAuthStore((s) => s.user?.role)
  const [warn, setWarn] = useState(false)
  const result = useQuery<{ data: { summary: Summary; rankings: Row[]; distribution: { labels: string[]; values: number[] } } }>({ queryKey: ['results', examId], queryFn: async () => (await api.get(`/results/${examId}`)).data })
  const generate = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/generate`)).data, onSuccess: () => toast.success('Generated') })
  const publish = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/publish`)).data, onSuccess: () => toast.success('Published') })
  const rows = result.data?.data.rankings ?? []
  const cols: Column<Row>[] = [{ key: 'rank', label: 'Rank' }, { key: 'name', label: 'Name' }, { key: 'adm_no', label: 'Adm No' }, { key: 'percentage', label: '%', render: (r) => r.percentage.toFixed(2) }, { key: 'grade', label: 'Grade' }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} label={r.status} /> }, { key: 'view', label: 'View', render: (r) => <Link className="text-[#2b6cb0]" href={`/results/${examId}/${r.id}`}>Open</Link> }]
  return <div className="space-y-4"><div className="grid md:grid-cols-5 gap-3"><StatCard title="Total" value={result.data?.data.summary.total ?? 0} /><StatCard title="Passed" value={result.data?.data.summary.passed ?? 0} /><StatCard title="Failed" value={result.data?.data.summary.failed ?? 0} /><StatCard title="Incomplete" value={result.data?.data.summary.incomplete ?? 0} /><StatCard title="Average %" value={(result.data?.data.summary.averagePercent ?? 0).toFixed(2)} /></div><Card title="Grade Distribution"><SubjectAveragesChart labels={result.data?.data.distribution.labels ?? []} values={result.data?.data.distribution.values ?? []} /></Card><Card title="Rankings"><Table columns={cols} data={rows} keyExtractor={(r) => r.id} loading={result.isLoading} /></Card><div className="flex flex-wrap gap-2">{role === 'ExamDept' ? <Button onClick={() => generate.mutate()} loading={generate.isPending}>Generate Results</Button> : null}{role === 'Principal' ? <Button onClick={() => (result.data?.data.summary.incomplete ?? 0) > 0 ? setWarn(true) : publish.mutate()} loading={publish.isPending}>Publish Results</Button> : null}<Button variant="secondary" onClick={() => downloadBlob(`/results/${examId}/class-report`, `class-report-${examId}.pdf`)}>Download Class Report</Button><Button variant="secondary" onClick={() => downloadBlob(`/results/${examId}/marksheet`, `marksheet-${examId}.pdf`)}>Download Marksheet</Button></div><Modal isOpen={warn} onClose={() => setWarn(false)} title="Incomplete records" footer={<><Button variant="secondary" onClick={() => setWarn(false)}>Cancel</Button><Button onClick={() => { setWarn(false); publish.mutate() }}>Publish Anyway</Button></>}><p>Some students are incomplete. Are you sure?</p></Modal></div>
}
