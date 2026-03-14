'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SubjectRow { id: string; name: string; maxMarks: number }
interface StudentRow { studentId: string; adm_no: string; name: string; marks?: number }
interface MarksPayload { examId: string; subjectId: string; marks: Array<{ studentId: string; marks: number }> }

export default function ExamMarksPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [marks, setMarks] = useState<Record<string, string>>({})

  const subjects = useQuery({ queryKey: ['exam-subjects', id], queryFn: async () => (await api.get<{ data: SubjectRow[] }>(`/exams/${id}/subjects`)).data })
  const students = useQuery({ queryKey: ['exam-students', id, selectedSubject], enabled: Boolean(selectedSubject), queryFn: async () => (await api.get<{ data: StudentRow[] }>(`/exams/${id}/marks`, { params: { subjectId: selectedSubject } })).data })
  const saveMutation = useMutation({ mutationFn: async (payload: MarksPayload) => (await api.post('/marks/bulk', payload)).data })

  const subject = useMemo(() => (subjects.data?.data ?? []).find((s) => s.id === selectedSubject), [subjects.data, selectedSubject])
  const rows = students.data?.data ?? []
  const completed = rows.filter((row) => marks[row.studentId] !== undefined || row.marks !== undefined).length

  const save = async () => {
    if (!subject) return
    const payload: MarksPayload = {
      examId: id,
      subjectId: subject.id,
      marks: rows.map((row) => ({ studentId: row.studentId, marks: Number(marks[row.studentId] ?? row.marks ?? 0) }))
    }
    try {
      await saveMutation.mutateAsync(payload)
      toast.success('Marks saved')
    } catch {
      toast.error('Failed to save marks')
    }
  }

  return (
    <Card title="Marks Entry" actions={<div className="text-sm text-gray-600">Completion: {completed}/{rows.length}</div>}>
      <div className="mb-4 flex flex-wrap gap-2">
        {(subjects.data?.data ?? []).map((s) => <button key={s.id} className={`rounded px-3 py-1 text-sm ${selectedSubject === s.id ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`} onClick={() => setSelectedSubject(s.id)}>{s.name}</button>)}
      </div>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1a365d] text-white"><tr><th className="px-3 py-2 text-left">Adm No</th><th className="px-3 py-2 text-left">Name</th><th className="px-3 py-2 text-left">Marks</th></tr></thead>
          <tbody>{rows.map((row) => { const value = marks[row.studentId] ?? String(row.marks ?? ''); const num = Number(value || 0); const overflow = subject ? num > subject.maxMarks : false; return <tr key={row.studentId} className="border-t"><td className="px-3 py-2">{row.adm_no}</td><td className="px-3 py-2">{row.name}</td><td className="px-3 py-2"><input type="number" min={0} max={subject?.maxMarks ?? 100} className={`w-24 rounded border px-2 py-1 ${overflow ? 'border-red-500 text-red-600' : ''}`} value={value} onChange={(e) => setMarks((prev) => ({ ...prev, [row.studentId]: e.target.value }))} /></td></tr>})}</tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2"><Button onClick={save} loading={saveMutation.isPending}>Save All</Button><Button variant="secondary" onClick={() => window.print()}>Download Template</Button><Button variant="secondary" onClick={() => toast.info('Upload Excel handled by backend endpoint integration')}>Upload Excel</Button></div>
    </Card>
  )
}
