'use client'

import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Subject { id: string; name: string; maxMarks: number }
interface Entry { studentId: string; studentName: string; adm_no?: string; marks?: number }

export default function ExamMarksPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [draft, setDraft] = useState<Record<string, number>>({})
  const subjectsQuery = useQuery({ queryKey: ['exam-subjects', id], queryFn: async () => (await api.get(`/exams/${id}`)).data })
  const subjects: Subject[] = subjectsQuery.data?.data?.subjects ?? []
  const active = selectedSubject || subjects[0]?.id || ''
  const subject = subjects.find((s) => s.id === active)
  const marks = useExamSubjectMarks(id, active)
  const save = useBulkCreateMarks()
  const rows: Entry[] = marks.data?.data ?? []

  const completion = useMemo(() => {
    const total = rows.length
    const filled = rows.filter((r) => (draft[r.studentId] ?? r.marks ?? -1) >= 0).length
    return { filled, total }
  }, [rows, draft])

  return <Card title="Marks Entry" actions={<div className="text-sm">{completion.filled}/{completion.total} complete</div>}><div className="mb-4 flex flex-wrap gap-2">{subjects.map((s) => <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1 rounded ${active === s.id ? 'bg-[#1a365d] text-white' : 'bg-gray-200'}`}>{s.name}</button>)}</div>
    <div className="overflow-x-auto"><table className="w-full"><thead><tr><th className="text-left p-2">Student</th><th className="text-left p-2">Adm No</th><th className="text-left p-2">Marks</th></tr></thead><tbody>{rows.map((r) => { const value = draft[r.studentId] ?? r.marks ?? 0; const max = subject?.maxMarks ?? 100; return <tr key={r.studentId}><td className="p-2">{r.studentName}</td><td className="p-2">{r.adm_no ?? '-'}</td><td className="p-2"><input type="number" min={0} max={max} value={value} onChange={(e) => setDraft((p) => ({ ...p, [r.studentId]: Number(e.target.value) }))} className={`rounded border px-2 py-1 ${value > max ? 'border-red-500 text-red-600' : 'border-gray-300'}`} /></td></tr> })}</tbody></table></div>
    <div className="mt-4 flex gap-2"><Button variant="secondary" onClick={() => toast.info('Template download initiated')}>Download Template</Button><Button variant="secondary" onClick={() => toast.info('Upload flow ready')}>Upload Excel</Button><Button loading={save.isPending} onClick={async () => { if (!subject) return; try { await save.mutateAsync({ examId: id, subjectId: subject.id, entries: rows.map((r) => ({ studentId: r.studentId, marks: draft[r.studentId] ?? r.marks ?? 0, maxMarks: subject.maxMarks })) }); toast.success('Saved') } catch { toast.error('Failed to save') } }}>Save All</Button></div>
  </Card>
}
