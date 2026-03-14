'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface StudentResultResponse {
  data: {
    student: { name: string; adm_no: string }
    summary: { total: number; percent: number; grade: string; status: 'PASS' | 'FAIL' }
    subjects: Array<{ subject: string; maxMarks: number; marks: number; percent: number; status: 'PASS' | 'FAIL' }>
  }
}

export default function StudentResultPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>()
  const result = useQuery<StudentResultResponse>({ queryKey: ['results', examId, studentId], queryFn: async () => (await api.get(`/results/${examId}/${studentId}`)).data })

  const download = async () => {
    const response = await api.get(`/results/${examId}/${studentId}/report-card`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(response.data as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-card-${studentId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className='space-y-4'>
      <Card title='Student Result'>
        <p><strong>Name:</strong> {result.data?.data.student.name}</p>
        <p><strong>Admission No:</strong> {result.data?.data.student.adm_no}</p>
      </Card>

      <Card title='Subjects'>
        <div className='overflow-x-auto rounded-xl border border-gray-200'>
          <table className='min-w-full'><thead className='bg-[#1a365d] text-white'><tr><th className='px-4 py-2 text-left text-xs'>Subject</th><th className='px-4 py-2 text-left text-xs'>Max</th><th className='px-4 py-2 text-left text-xs'>Marks</th><th className='px-4 py-2 text-left text-xs'>%</th><th className='px-4 py-2 text-left text-xs'>Status</th></tr></thead><tbody>{(result.data?.data.subjects ?? []).map((item, index) => <tr key={item.subject} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className='px-4 py-2'>{item.subject}</td><td className='px-4 py-2'>{item.maxMarks}</td><td className='px-4 py-2'>{item.marks}</td><td className='px-4 py-2'>{item.percent.toFixed(2)}</td><td className='px-4 py-2'><Badge status={item.status} /></td></tr>)}</tbody></table>
        </div>
      </Card>

      <Card title='Summary' actions={<Badge status={result.data?.data.summary.status ?? 'FAIL'} />}>
        <p>Total: <strong>{result.data?.data.summary.total ?? 0}</strong></p>
        <p>Percentage: <strong>{result.data?.data.summary.percent ?? 0}%</strong></p>
        <p>Grade: <strong>{result.data?.data.summary.grade ?? '-'}</strong></p>
      </Card>

      <Button onClick={() => void download()}>Download Report Card PDF</Button>
    </div>
  )
}
