'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface SubjectItem { subjectId: string; subjectName: string; maxMarks: number }
interface StudentMark { studentId: string; studentName: string; adm_no: string; marks: number | null }
interface MarksPageResponse { data: { subjects: SubjectItem[]; rows: Record<string, StudentMark[]> } }

export default function ExamMarksPage() {
  const { id } = useParams<{ id: string }>()
  const [subjectId, setSubjectId] = useState('')
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Record<string, number | ''>>({})

  const marks = useQuery<MarksPageResponse>({ queryKey: ['exam', id, 'marks'], queryFn: async () => (await api.get(`/exams/${id}/marks`)).data })

  const subjects = marks.data?.data.subjects ?? []
  const activeSubjectId = subjectId || subjects[0]?.subjectId || ''
  const activeSubject = subjects.find((subject) => subject.subjectId === activeSubjectId)
  const rows = marks.data?.data.rows[activeSubjectId] ?? []

  const completion = useMemo(() => {
    const total = rows.length
    const filled = rows.filter((row) => (draft[row.studentId] ?? row.marks) !== null && (draft[row.studentId] ?? row.marks) !== '').length
    return { filled, total }
  }, [draft, rows])

  const save = useMutation({
    mutationFn: async () => {
      const payload = rows.map((row) => ({ studentId: row.studentId, subjectId: activeSubjectId, marks: Number(draft[row.studentId] ?? row.marks ?? 0) }))
      return (await api.post('/marks/bulk', { examId: id, entries: payload })).data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exam', id, 'marks'] })
      toast.success('Marks saved')
    }
  })

  return <Card title='Enter Marks' actions={<p className='text-sm text-gray-600'>{completion.filled}/{completion.total} completed</p>}>
    <div className='mb-4 flex flex-wrap gap-2'>{subjects.map((subject) => <button key={subject.subjectId} onClick={() => setSubjectId(subject.subjectId)} className={`rounded-lg px-3 py-1.5 text-sm ${activeSubjectId === subject.subjectId ? 'bg-[#1a365d] text-white' : 'bg-gray-100'}`}>{subject.subjectName}</button>)}</div>
    <div className='overflow-x-auto rounded-xl border border-gray-200'>
      <table className='min-w-full'><thead className='bg-[#1a365d] text-white'><tr><th className='px-4 py-2 text-left text-xs'>Adm No</th><th className='px-4 py-2 text-left text-xs'>Name</th><th className='px-4 py-2 text-left text-xs'>Marks</th></tr></thead><tbody>{rows.map((row, index) => {const value = draft[row.studentId] ?? row.marks ?? ''; const exceeded = typeof value === 'number' && value > (activeSubject?.maxMarks ?? 100); return <tr key={row.studentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className='px-4 py-2'>{row.adm_no}</td><td className='px-4 py-2'>{row.studentName}</td><td className='px-4 py-2'><input type='number' min={0} max={activeSubject?.maxMarks ?? 100} value={value} onChange={(event) => setDraft((prev) => ({ ...prev, [row.studentId]: event.target.value === '' ? '' : Number(event.target.value) }))} className={`w-28 rounded border px-2 py-1 ${exceeded ? 'border-red-500 text-red-600' : 'border-gray-300'}`} /></td></tr>})}</tbody></table>
    </div>
    <div className='mt-4 flex flex-wrap gap-2'><Button onClick={() => void save.mutateAsync()} loading={save.isPending}>Save All</Button><Button variant='secondary' onClick={() => toast.info('Template download initiated')}>Download Template</Button><Button variant='secondary' onClick={() => toast.info('Upload flow initiated')}>Upload Excel</Button></div>
  </Card>
}
