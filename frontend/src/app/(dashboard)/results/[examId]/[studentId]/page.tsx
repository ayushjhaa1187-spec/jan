'use client'

import { useParams } from 'next/navigation'
import { useStudentResult } from '@/hooks/useResults'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

export default function StudentReportCardPage() {
  const params = useParams<{ examId: string; studentId: string }>()
  const result = useStudentResult(params.examId, params.studentId)

  const data = result.data?.data

  return (
    <div className='space-y-4'>
      <Card title='Report Card'>
        <p><strong>Student:</strong> {data?.student?.firstName} {data?.student?.lastName}</p>
        <p><strong>Adm No:</strong> {data?.student?.enrollmentNo}</p>
        <p><strong>Class:</strong> {data?.student?.class?.name} - {data?.student?.class?.section}</p>
        <p><strong>Exam:</strong> {data?.exam?.name}</p>
      </Card>

      <Card title='Subject-wise Performance'>
        <Table
          columns={[
            { key: 'subject', label: 'Subject', render: (row) => (row as { subject: { name: string } }).subject.name },
            { key: 'maxMarks', label: 'Max' },
            { key: 'marks', label: 'Marks' },
            { key: 'percentage', label: 'Percentage' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={(row as { status: string }).status} /> },
          ]}
          data={data?.subjects ?? []}
        />
      </Card>

      <Card title='Summary'>
        <p>Total: {data?.summary?.total ?? 0}/{data?.summary?.max ?? 0}</p>
        <p>Percentage: {data?.summary?.percentage ?? 0}%</p>
        <p>Grade: {data?.summary?.grade ?? '-'}</p>
        <p>Remarks: {data?.summary?.remarks ?? '-'}</p>
        <p>Result: <Badge status={data?.summary?.result ?? 'INCOMPLETE'} /></p>
        <Button className='mt-3' variant='secondary' onClick={() => window.open(`/api/reports/report-card/${params.examId}/${params.studentId}`, '_blank')}>Download Report Card PDF</Button>
      </Card>
    </div>
  )
}
