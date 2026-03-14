'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface SubjectResult { id: string; subject: string; maxMarks: number; marks: number; percent: number; status: 'PASS' | 'FAIL' }
interface DetailRes { data: { studentName: string; adm_no: string; subjects: SubjectResult[]; summary: { total: number; percentage: number; grade: string; status: 'PASS' | 'FAIL' } } }

export default function StudentResultPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>()
  const details = useQuery<DetailRes>({ queryKey: ['student-result', examId, studentId], queryFn: async () => (await api.get(`/results/${examId}/${studentId}`)).data })

  const download = async () => {
    const response = await api.get(`/results/${examId}/${studentId}/report-card`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-card-${studentId}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return <div className="space-y-4"><Card title="Student"><p><strong>Name:</strong> {details.data?.data.studentName}</p><p><strong>Adm No:</strong> {details.data?.data.adm_no}</p></Card><Card title="Subjects"><table className="w-full text-sm"><thead><tr><th className="text-left">Subject</th><th>Max</th><th>Marks</th><th>%</th><th>Status</th></tr></thead><tbody>{(details.data?.data.subjects ?? []).map((s) => <tr key={s.id} className="border-t"><td className="py-2">{s.subject}</td><td className="text-center">{s.maxMarks}</td><td className="text-center">{s.marks}</td><td className="text-center">{s.percent.toFixed(2)}</td><td className="text-center"><Badge status={s.status} /></td></tr>)}</tbody></table></Card><Card title="Summary"><div className="grid md:grid-cols-4 gap-2"><p>Total: {details.data?.data.summary.total}</p><p>%: {details.data?.data.summary.percentage.toFixed(2)}</p><p>Grade: {details.data?.data.summary.grade}</p><p>Status: <Badge status={details.data?.data.summary.status ?? 'FAIL'} /></p></div></Card><Button onClick={download}>Download Report Card PDF</Button></div>
}
