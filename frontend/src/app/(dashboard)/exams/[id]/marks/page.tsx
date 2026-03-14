'use client'

import { useParams } from 'next/navigation'
import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Subject { 
  id: string; 
  name: string; 
  maxMarks: number 
}

interface Entry { 
  studentId: string; 
  studentName: string; 
  adm_no?: string; 
  marks?: number 
}

export default function ExamMarksPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [draft, setDraft] = useState<Record<string, number>>({})

  const subjectsQuery = useQuery({ 
    queryKey: ['exam-subjects', id], 
    queryFn: async () => (await api.get(`/exams/${id}`)).data,
    enabled: !!id
  })

  const subjects = useMemo(() => 
    (subjectsQuery.data?.data?.subjects as Subject[]) ?? [], 
    [subjectsQuery.data]
  )
  
  const activeSubjectId = selectedSubject || subjects[0]?.id || ''
  const subject = useMemo(() => 
    subjects.find((s) => s.id === activeSubjectId), 
    [subjects, activeSubjectId]
  )

  const marksQuery = useExamSubjectMarks(id, activeSubjectId)
  
  const rows = useMemo(() => 
    (marksQuery.data?.data as Entry[]) ?? [], 
    [marksQuery.data]
  )
  
  const saveMutation = useBulkCreateMarks()

  const completion = useMemo(() => {
    const total = rows.length
    if (total === 0) return { filled: 0, total: 0 }
    
    const filled = rows.filter((r) => {
      const val = draft[r.studentId] !== undefined ? draft[r.studentId] : r.marks
      return val !== undefined && val !== null && val >= 0
    }).length
    
    return { filled, total }
  }, [rows, draft])

  const handleSave = async () => {
    if (!subject || !id) return
    
    try {
      const entries = rows.map((r) => ({
        studentId: r.studentId,
        marks: draft[r.studentId] !== undefined ? draft[r.studentId] : (r.marks ?? 0),
        maxMarks: subject.maxMarks
      }))

      await saveMutation.mutateAsync({
        examId: id,
        subjectId: subject.id,
        entries
      })
      
      toast.success('Marks saved successfully')
      setDraft({}) // Clear draft after successful save
      void marksQuery.refetch()
    } catch (error) {
      toast.error('Failed to save marks')
    }
  }

  return (
    <div className="space-y-6">
      <Card 
        title="Marks Entry Terminal" 
        actions={
          <div className="text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {completion.filled} / {completion.total} Students Graded
          </div>
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button 
              key={s.id} 
              onClick={() => {
                setSelectedSubject(s.id)
                setDraft({}) // Reset draft when switching subjects
              }} 
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeSubjectId === s.id 
                  ? 'bg-[#1a365d] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Student Name</th>
                <th className="p-4 font-semibold text-gray-700">Admission No</th>
                <th className="p-4 font-semibold text-gray-700">Marks (Max: {subject?.maxMarks ?? 100})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {marksQuery.isLoading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">Loading student list...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">No students assigned to this subject.</td>
                </tr>
              ) : (
                rows.map((r) => {
                  const currentValue = draft[r.studentId] !== undefined ? draft[r.studentId] : (r.marks ?? 0)
                  const max = subject?.maxMarks ?? 100
                  const isInvalid = currentValue > max
                  
                  return (
                    <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{r.studentName}</td>
                      <td className="p-4 text-gray-600">{r.adm_no ?? '-'}</td>
                      <td className="p-4">
                        <input 
                          type="number" 
                          min={0} 
                          max={max} 
                          value={currentValue} 
                          onChange={(e) => setDraft(p => ({ ...p, [r.studentId]: Number(e.target.value) }))}
                          className={`w-24 rounded-md border px-3 py-1.5 text-sm font-semibold transition-all focus:ring-2 focus:ring-blue-100 outline-none ${
                            isInvalid ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                          }`} 
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.info('Template download is being prepared')}>
            Export Template
          </Button>
          <Button variant="secondary" onClick={() => toast.info('Excel import module loading')}>
            Import Excel
          </Button>
          <div className="flex-1" />
          <Button 
            loading={saveMutation.isPending} 
            onClick={handleSave}
            disabled={completion.total === 0}
            className="px-8"
          >
            Commit All Grades
          </Button>
        </div>
      </Card>
    </div>
  )
}
