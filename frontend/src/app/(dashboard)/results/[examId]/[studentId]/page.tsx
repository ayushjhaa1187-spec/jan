'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SubjectMark { id: string; subject: string; max: number; marks: number; percentage: number; status: string }
interface DetailResponse { data: { student: { name: string; adm_no: string }; summary: { total: number; percentage: number; grade: string; status: string }; subjects: SubjectMark[] } }

export default function StudentResultPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>()
  const result = useQuery({ queryKey: ['result', examId, studentId], queryFn: async () => (await api.get<DetailResponse>(`/results/${examId}/${studentId}`)).data })

  const download = async () => {
    const response = await api.get(`/results/${examId}/${studentId}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report-card.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card title="Student Result">
        <p><strong>Name:</strong> {result.data?.data.student.name}</p>
        <p><strong>Admission No:</strong> {result.data?.data.student.adm_no}</p>
      </Card>
      <Card title="Subject Marks">
        <table className="min-w-full text-sm"><thead><tr className="bg-[#1a365d] text-white"><th className="px-3 py-2 text-left">Subject</th><th className="px-3 py-2">Max</th><th className="px-3 py-2">Marks</th><th className="px-3 py-2">%</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{(result.data?.data.subjects ?? []).map((s) => <tr key={s.id} className="border-t"><td className="px-3 py-2">{s.subject}</td><td className="px-3 py-2 text-center">{s.max}</td><td className="px-3 py-2 text-center">{s.marks}</td><td className="px-3 py-2 text-center">{s.percentage}%</td><td className="px-3 py-2 text-center">{s.status}</td></tr>)}</tbody></table>
      </Card>
      <Card title="Summary"><p>Total: {result.data?.data.summary.total}</p><p>Percentage: {result.data?.data.summary.percentage}%</p><p>Grade: {result.data?.data.summary.grade}</p><p>Status: {result.data?.data.summary.status}</p></Card>
      <Button onClick={() => void download()}>Download Report Card PDF</Button>
    </div>
  )
}
