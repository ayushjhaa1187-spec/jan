'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SubjectRow { id: string; name: string; maxMarks: number }
interface StudentMark { studentId: string; studentName: string; marks?: number }

export default function MarksEntryPage() {
  const id = useParams<{ id: string }>().id
  const [active, setActive] = useState('')
  const [values, setValues] = useState<Record<string, number>>({})
  const subjects = useQuery<{ data: SubjectRow[] }>({ queryKey: ['exam-subjects', id], queryFn: async () => (await api.get(`/exams/${id}/subjects`)).data })
  const marks = useQuery<{ data: StudentMark[] }>({ queryKey: ['exam-marks', id, active], queryFn: async () => (await api.get(`/marks/exam/${id}`, { params: { subjectId: active } })).data, enabled: Boolean(active) })
  const save = useMutation({ mutationFn: async () => (await api.post('/marks/bulk', { examId: id, subjectId: active, marks: Object.entries(values).map(([studentId, marksValue]) => ({ studentId, marks: marksValue })) })).data, onSuccess: () => toast.success('Saved') })
  const activeSubject = (subjects.data?.data ?? []).find((s) => s.id === active)
  const rows = marks.data?.data ?? []
  const filled = rows.filter((r) => typeof values[r.studentId] === 'number').length
  return <Card title="Marks Entry" actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/marks/template?examId=${id}&subjectId=${active}`, '_blank')}>Download Template</Button><Button variant="secondary" onClick={() => toast.info('Upload endpoint can be connected to your file picker flow')}>Upload Excel</Button></div>}><div className="mb-3 flex gap-2 flex-wrap">{(subjects.data?.data ?? []).map((s) => <button key={s.id} onClick={() => setActive(s.id)} className={`rounded px-3 py-1 text-sm ${active === s.id ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`}>{s.name}</button>)}</div><p className="mb-2 text-sm text-gray-600">Completion: {filled}/{rows.length}</p><table className="w-full text-sm"><thead><tr><th className="text-left">Student</th><th className="text-left">Marks</th></tr></thead><tbody>{rows.map((row) => { const v = values[row.studentId] ?? row.marks ?? 0; const over = activeSubject ? v > activeSubject.maxMarks : false; return <tr key={row.studentId} className="border-t"><td className="py-2">{row.studentName}</td><td><input type="number" min={0} max={activeSubject?.maxMarks ?? 100} value={v} onChange={(e) => setValues((prev) => ({ ...prev, [row.studentId]: Number(e.target.value) }))} className={`rounded border px-2 py-1 ${over ? 'border-red-500 text-red-600' : ''}`} /></td></tr>})}</tbody></table><div className="mt-3"><Button onClick={() => save.mutate()} loading={save.isPending} disabled={!active}>Save All</Button></div></Card>
}
