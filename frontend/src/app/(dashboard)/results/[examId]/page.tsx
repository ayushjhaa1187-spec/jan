'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'

interface ResultsResponse {
  data: {
    summary: { total: number; passed: number; failed: number; incomplete: number; average: number }
    gradeDistribution: { labels: string[]; values: number[] }
    students: Array<{ studentId: string; rank: number; name: string; adm_no: string; percent: number; grade: string; status: 'PASS' | 'FAIL' | 'INCOMPLETE' }>
  }
}

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>()
  const role = useAuthStore((state) => state.user?.role)
  const [warnOpen, setWarnOpen] = useState(false)

  const results = useQuery<ResultsResponse>({ queryKey: ['results', examId], queryFn: async () => (await api.get(`/results/${examId}`)).data })
  const generate = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/generate`)).data, onSuccess: () => toast.success('Results generated') })
  const publish = useMutation({ mutationFn: async () => (await api.post(`/results/${examId}/publish`)).data, onSuccess: () => toast.success('Results published') })

  const downloadBlob = async (url: string, name: string) => {
    const response = await api.get(url, { responseType: 'blob' })
    const blobUrl = window.URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = name
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  }

  const summary = results.data?.data.summary

  return (
    <div className='space-y-4'>
      <Card title='Summary'>
        <div className='grid gap-3 md:grid-cols-5'>
          <p>Total: <strong>{summary?.total ?? 0}</strong></p>
          <p>Passed: <strong>{summary?.passed ?? 0}</strong></p>
          <p>Failed: <strong>{summary?.failed ?? 0}</strong></p>
          <p>Incomplete: <strong>{summary?.incomplete ?? 0}</strong></p>
          <p>Average: <strong>{summary?.average ?? 0}%</strong></p>
        </div>
      </Card>

      <Card title='Grade Distribution'>
        <SubjectAveragesChart labels={results.data?.data.gradeDistribution.labels ?? []} values={results.data?.data.gradeDistribution.values ?? []} />
      </Card>

      <Card title='Ranked Students' actions={<div className='flex gap-2'>{role === 'ExamDept' && <Button loading={generate.isPending} onClick={() => void generate.mutateAsync()}>Generate Results</Button>}{role === 'Principal' && <Button loading={publish.isPending} onClick={() => (summary?.incomplete ?? 0) > 0 ? setWarnOpen(true) : void publish.mutateAsync()}>Publish Results</Button>}<Button variant='secondary' onClick={() => void downloadBlob(`/results/${examId}/reports/class`, 'class-report.pdf')}>Download Class Report</Button><Button variant='secondary' onClick={() => void downloadBlob(`/results/${examId}/reports/marksheet`, 'marksheet.pdf')}>Download Marksheet</Button></div>}>
        <div className='overflow-x-auto rounded-xl border border-gray-200'>
          <table className='min-w-full'><thead className='bg-[#1a365d] text-white'><tr><th className='px-4 py-2 text-left text-xs'>Rank</th><th className='px-4 py-2 text-left text-xs'>Name</th><th className='px-4 py-2 text-left text-xs'>Adm No</th><th className='px-4 py-2 text-left text-xs'>%</th><th className='px-4 py-2 text-left text-xs'>Grade</th><th className='px-4 py-2 text-left text-xs'>Status</th><th className='px-4 py-2 text-left text-xs'>Action</th></tr></thead><tbody>{(results.data?.data.students ?? []).map((row, index) => <tr key={row.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className='px-4 py-2'>{row.rank}</td><td className='px-4 py-2'>{row.name}</td><td className='px-4 py-2'>{row.adm_no}</td><td className='px-4 py-2'>{row.percent.toFixed(2)}</td><td className='px-4 py-2'>{row.grade}</td><td className='px-4 py-2'><Badge status={row.status} /></td><td className='px-4 py-2'><Link className='text-[#2b6cb0]' href={`/results/${examId}/${row.studentId}`}>View</Link></td></tr>)}</tbody></table>
        </div>
      </Card>

      <Modal isOpen={warnOpen} onClose={() => setWarnOpen(false)} title='Incomplete Results Warning' footer={<><Button variant='secondary' onClick={() => setWarnOpen(false)}>Cancel</Button><Button onClick={() => void publish.mutateAsync().then(() => setWarnOpen(false))}>Publish Anyway</Button></>}>
        There are incomplete results. Are you sure you want to publish?
      </Modal>
    </div>
  )
}
