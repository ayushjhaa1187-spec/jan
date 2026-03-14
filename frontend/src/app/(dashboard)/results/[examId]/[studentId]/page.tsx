'use client'

import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useStudentResult } from '@/hooks/useResults'

export default function StudentReportCardPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>()
  const result = useStudentResult(examId, studentId)
  const data = result.data?.data
  const subjects: Array<{ subject: string; maxMarks: number; marks: number; percentage: number; result: 'PASS' | 'FAIL' }> = data?.subjects ?? []

  return <div className="space-y-4"><Card title={data?.studentName ?? 'Student'}><div className="grid md:grid-cols-4 gap-3"><div><p className="text-xs text-gray-500">Total</p><p className="font-semibold">{data?.total ?? 0}</p></div><div><p className="text-xs text-gray-500">Percentage</p><p className="font-semibold">{Number(data?.percentage ?? 0).toFixed(2)}%</p></div><div><p className="text-xs text-gray-500">Grade</p><p className="font-semibold">{data?.grade ?? '-'}</p></div><div><p className="text-xs text-gray-500">Result</p><Badge status={data?.result ?? 'INCOMPLETE'} /></div></div></Card>
    <Card title="Subjects" actions={<Button variant="secondary" onClick={() => toast.info('Downloading report card...')}>Download Report Card PDF</Button>}><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Subject</th><th>Max</th><th>Marks</th><th>%</th><th>Status</th></tr></thead><tbody>{subjects.map((s) => <tr key={s.subject}><td>{s.subject}</td><td>{s.maxMarks}</td><td>{s.marks}</td><td>{s.percentage.toFixed(2)}</td><td><Badge status={s.result} /></td></tr>)}</tbody></table></div></Card></div>
}
