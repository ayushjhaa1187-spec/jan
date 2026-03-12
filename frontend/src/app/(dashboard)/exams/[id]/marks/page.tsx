'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'

interface EditableRow {
  studentId: string
  admNo: string
  name: string
  marks: number
  maxMarks: number
  remarks: string
}

export default function MarksEntryPage() {
  const params = useParams<{ id: string }>()
  const examId = params.id
  const user = useAuthStore((state) => state.user)
  const [subjectId, setSubjectId] = useState('')
  const [rows, setRows] = useState<EditableRow[]>([])

  const exam = useQuery({ queryKey: ['exam', examId], queryFn: async () => (await api.get(`/exams/${examId}`)).data })
  const assignments = useQuery({
    queryKey: ['teacher-subjects', exam.data?.data?.classId],
    queryFn: async () => (await api.get(`/teacher-subjects/class/${exam.data?.data?.classId}`)).data,
    enabled: Boolean(exam.data?.data?.classId),
  })

  const subjectMarks = useExamSubjectMarks(examId, subjectId)
  const saveBulk = useBulkCreateMarks()

  const subjects = useMemo(() => {
    const assignmentRows = (assignments.data?.data as Array<{ subjectId: string; subject: { name: string; code: string } }> | undefined) ?? []
    return assignmentRows
  }, [assignments.data])

  const maxMarks = 100

  const syncRows = () => {
    const entries = (subjectMarks.data?.data?.entries as Array<{ student: { id: string; adm_no: string; name: string }; marks: number; remarks?: string }> | undefined) ?? []
    setRows(entries.map((entry) => ({ studentId: entry.student.id, admNo: entry.student.adm_no, name: entry.student.name, marks: entry.marks, maxMarks, remarks: entry.remarks || '' })))
  }

  const updateRow = (index: number, key: 'marks' | 'remarks', value: string) => {
    setRows((prev) => prev.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === 'marks' ? Number(value) : value } : row))
  }

  const saveAll = async () => {
    try {
      await saveBulk.mutateAsync({ examId, subjectId, entries: rows.map((row) => ({ studentId: row.studentId, marks: row.marks, remarks: row.remarks, maxMarks: row.maxMarks })) })
      toast.success('Marks saved successfully')
    } catch {
      toast.error('Failed to save marks')
    }
  }

  const downloadTemplate = async () => {
    try {
      const { data } = await api.get(`/marks/template/${examId}/${subjectId}`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `marks_template_${examId}_${subjectId}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download template')
    }
  }

  const uploadExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await api.post(`/marks/upload/${examId}/${subjectId}`, { rows: [] })
      toast.success('Upload processed')
    } catch {
      toast.error('Upload failed')
    }
  }

  return (
    <Card title='Marks Entry'>
      <div className='mb-4 flex flex-wrap gap-2'>
        {subjects.map((subject) => (
          <Button key={subject.subjectId} variant={subjectId === subject.subjectId ? 'primary' : 'secondary'} onClick={() => { setSubjectId(subject.subjectId); setRows([]) }}>
            {subject.subject.name}
          </Button>
        ))}
        <Button variant='secondary' onClick={syncRows}>Load Marks</Button>
      </div>

      <Table
        columns={[
          { key: 'admNo', label: 'Adm No' },
          { key: 'name', label: 'Student Name' },
          { key: 'marks', label: 'Marks', render: (row) => {
            const idx = rows.findIndex((item) => item.studentId === (row as EditableRow).studentId)
            return <input className={`w-24 rounded border px-2 py-1 ${(row as EditableRow).marks > maxMarks ? 'border-red-500' : ''}`} type='number' value={(row as EditableRow).marks} min={0} max={maxMarks} onChange={(event) => updateRow(idx, 'marks', event.target.value)} />
          } },
          { key: 'remarks', label: 'Remarks', render: (row) => {
            const idx = rows.findIndex((item) => item.studentId === (row as EditableRow).studentId)
            return <input className='w-full rounded border px-2 py-1' value={(row as EditableRow).remarks} onChange={(event) => updateRow(idx, 'remarks', event.target.value)} />
          } },
          { key: 'status', label: 'Status', render: (row) => ((row as EditableRow).marks > maxMarks ? <span className='text-red-600'>Exceeded</span> : 'OK') },
        ]}
        data={rows}
      />

      <p className='mt-3 text-sm text-slate-600'>{rows.filter((row) => row.marks >= 0).length} of {rows.length} students marked</p>

      <div className='mt-4 flex flex-wrap gap-2'>
        <Button onClick={saveAll} loading={saveBulk.isPending}>Save All</Button>
        <Button variant='secondary' onClick={downloadTemplate}>Download Template</Button>
        <label className='inline-flex items-center rounded border px-3 py-2 text-sm'>
          Upload Excel
          <input type='file' className='hidden' accept='.xlsx,.xls' onChange={uploadExcel} />
        </label>
      </div>
    </Card>
  )
}
