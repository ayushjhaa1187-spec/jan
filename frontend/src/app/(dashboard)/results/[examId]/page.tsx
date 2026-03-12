'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useExamResults, useGenerateResults, usePublishResults, useResultsSummary } from '@/hooks/useResults'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart'

export default function ExamResultsPage() {
  const params = useParams<{ examId: string }>()
  const examId = params.examId
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [confirmPublish, setConfirmPublish] = useState(false)

  const summary = useResultsSummary(examId)
  const results = useExamResults(examId)
  const generateResults = useGenerateResults(examId)
  const publishResults = usePublishResults(examId)

  const summaryData = summary.data?.data

  const downloadBlob = async (path: string, filename: string) => {
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
      <Card title='Summary'>
        <p>Total: {summaryData?.total ?? 0} | Passed: {summaryData?.passed ?? 0} | Failed: {summaryData?.failed ?? 0} | Incomplete: {summaryData?.incomplete ?? 0} | Average: {summaryData?.averagePercentage ?? 0}% | Pass Rate: {summaryData?.passRate ?? 0}%</p>
      </Card>

      <Card title='Grade Distribution'>
        <SubjectAveragesChart labels={['A', 'B', 'C', 'D']} values={[12, 18, 9, 4]} />
      </Card>

      <Card title='Ranked Results'>
        <Table
          columns={[
            { key: 'rank', label: 'Rank', render: (row) => String((row as { rank?: number }).rank ?? '-') },
            { key: 'student', label: 'Student', render: (row) => `${(row as { student?: { enrollmentNo?: string; firstName?: string; lastName?: string } }).student?.enrollmentNo || ''} ${(row as { student?: { enrollmentNo?: string; firstName?: string; lastName?: string } }).student?.firstName || ''}` },
            { key: 'percentage', label: '%', render: (row) => `${(row as { percentage?: number }).percentage ?? 0}` },
            { key: 'grade', label: 'Grade', render: (row) => (row as { grade?: string }).grade || '-' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={(row as { status?: string }).status || 'INCOMPLETE'} /> },
            { key: 'actions', label: 'Actions', render: (row) => <button className='text-[#2b6cb0]' onClick={() => router.push(`/results/${examId}/${(row as { studentId: string }).studentId}`)}>View Report Card</button> },
          ]}
          data={results.data?.data ?? []}
          loading={results.isLoading}
        />

        <div className='mt-4 flex flex-wrap gap-2'>
          {user?.role === 'ExamDept' ? <Button onClick={async () => {
            try { await generateResults.mutateAsync(); toast.success('Results generated') } catch { toast.error('Generate failed') }
          }} loading={generateResults.isPending}>Generate Results</Button> : null}

          {user?.role === 'Principal' ? <Button onClick={() => setConfirmPublish(true)} loading={publishResults.isPending}>Publish Results</Button> : null}

          <Button variant='secondary' onClick={() => void downloadBlob(`/api/reports/class-report/${examId}`, `class-report-${examId}.pdf`)}>Class Report PDF</Button>
          <Button variant='secondary' onClick={() => void downloadBlob(`/api/reports/marksheet/${examId}`, `marksheet-${examId}.pdf`)}>Marksheet PDF</Button>
        </div>
      </Card>

      <Modal open={confirmPublish} onClose={() => setConfirmPublish(false)} title='Publish Results' footer={<><Button variant='secondary' onClick={() => setConfirmPublish(false)}>Cancel</Button><Button onClick={async () => {
        try {
          await publishResults.mutateAsync((summaryData?.incomplete ?? 0) > 0)
          toast.success('Results published')
          setConfirmPublish(false)
        } catch {
          toast.error('Publish failed')
        }
      }}>Confirm</Button></>}>
        <p>{(summaryData?.incomplete ?? 0) > 0 ? `${summaryData?.incomplete} students have incomplete marks. Force publish?` : 'Publish results now?'}</p>
      </Modal>
    </div>
  )
}
