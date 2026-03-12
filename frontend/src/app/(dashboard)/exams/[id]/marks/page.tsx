'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Assignment {
  subjectId: string;
  classId: string;
  subject?: { name: string; maxMarks?: number };
}

interface MarksRow {
  student: { id: string; adm_no: string; name: string };
  marks: number;
  maxMarks: number;
}

export default function ExamMarksPage() {
  const params = useParams<{ id: string }>();
  const examId = params.id;
  const user = useAuthStore((state) => state.user);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [draftMarks, setDraftMarks] = useState<Record<string, { marks: number; remarks?: string }>>({});

  const examQuery = useQuery({ queryKey: ['exam', examId], queryFn: async () => (await api.get(`/exams/${examId}`)).data.data });

  const classAssignmentsQuery = useQuery({
    queryKey: ['teacher-subjects', 'class', examQuery.data?.classId],
    queryFn: async () => (await api.get<{ data: Assignment[] }>(`/teacher-subjects/class/${examQuery.data.classId}`)).data.data,
    enabled: Boolean(examQuery.data?.classId),
  });

  const teacherAssignmentsQuery = useQuery({
    queryKey: ['teacher-subjects', 'teacher', user?.id],
    queryFn: async () => (await api.get<{ data: Assignment[] }>(`/teacher-subjects/teacher/${user?.id}`)).data.data,
    enabled: user?.role === 'Teacher' && Boolean(user?.id),
  });

  const assignments = useMemo(() => {
    const list = classAssignmentsQuery.data || [];
    if (user?.role !== 'Teacher') return list;
    const allowed = new Set((teacherAssignmentsQuery.data || []).map((item) => item.subjectId));
    return list.filter((item) => allowed.has(item.subjectId));
  }, [classAssignmentsQuery.data, teacherAssignmentsQuery.data, user?.role]);

  const subjectId = selectedSubjectId || assignments[0]?.subjectId || '';
  const marksQuery = useExamSubjectMarks(examId, subjectId);
  const bulkCreateMarks = useBulkCreateMarks();

  const rows = useMemo(() => {
    const data = marksQuery.data as { entries?: MarksRow[] } | undefined;
    return data?.entries || [];
  }, [marksQuery.data]);

  const saveAll = async () => {
    try {
      const entries = rows.map((row) => ({
        studentId: row.student.id,
        marks: draftMarks[row.student.id]?.marks ?? row.marks ?? 0,
        maxMarks: row.maxMarks || 100,
        remarks: draftMarks[row.student.id]?.remarks,
      }));

      await bulkCreateMarks.mutateAsync({ examId, subjectId, entries });
      toast.success('Marks saved successfully');
    } catch {
      toast.error('Failed to save marks');
    }
  };

  const downloadTemplate = async () => {
    try {
      const { data } = await api.get<{ data: Array<{ adm_no: string; name: string }> }>(`/marks/template/${examId}/${subjectId}`);
      const csv = ['adm_no,name', ...data.data.map((row) => `${row.adm_no},${row.name}`)].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marks_template_${examId}_${subjectId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const uploadFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsedRows = text
        .split('\n')
        .slice(1)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [adm_no, marks] = line.split(',');
          return { adm_no, marks: Number(marks || 0) };
        });

      await api.post(`/marks/upload/${examId}/${subjectId}`, { rows: parsedRows });
      toast.success('Upload processed');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <Card title='Marks Entry'>
      <div className='mb-4 flex flex-wrap gap-2'>
        {assignments.map((assignment) => (
          <button
            key={assignment.subjectId}
            type='button'
            onClick={() => setSelectedSubjectId(assignment.subjectId)}
            className={`rounded px-3 py-1 text-sm ${subjectId === assignment.subjectId ? 'bg-primary text-white' : 'bg-slate-100'}`}
          >
            {assignment.subject?.name || assignment.subjectId}
          </button>
        ))}
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead><tr><th className='p-2 text-left'>Adm No</th><th className='p-2 text-left'>Student</th><th className='p-2 text-left'>Marks</th><th className='p-2 text-left'>Remarks</th></tr></thead>
          <tbody>
            {rows.map((row) => {
              const value = draftMarks[row.student.id]?.marks ?? row.marks;
              const max = row.maxMarks || 100;
              const invalid = value > max;
              return (
                <tr key={row.student.id} className='border-t'>
                  <td className='p-2'>{row.student.adm_no}</td>
                  <td className='p-2'>{row.student.name}</td>
                  <td className='p-2'>
                    <input
                      type='number'
                      min={0}
                      max={max}
                      className={`h-9 w-28 rounded border px-2 ${invalid ? 'border-danger' : 'border-slate-300'}`}
                      value={Number.isFinite(value) ? value : 0}
                      onChange={(event) => setDraftMarks((current) => ({ ...current, [row.student.id]: { ...current[row.student.id], marks: Number(event.target.value) } }))}
                    />
                    {invalid ? <p className='text-xs text-danger'>Exceeds max {max}</p> : null}
                  </td>
                  <td className='p-2'>
                    <input
                      className='h-9 w-44 rounded border border-slate-300 px-2'
                      value={draftMarks[row.student.id]?.remarks || ''}
                      onChange={(event) => setDraftMarks((current) => ({ ...current, [row.student.id]: { ...current[row.student.id], marks: value, remarks: event.target.value } }))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className='mt-3 text-sm text-slate-600'>
        {rows.filter((row) => (draftMarks[row.student.id]?.marks ?? row.marks) >= 0).length} of {rows.length} students marked
      </p>

      <div className='mt-4 flex flex-wrap gap-2'>
        <Button onClick={() => void saveAll()} loading={bulkCreateMarks.isPending}>Save All</Button>
        <Button variant='secondary' onClick={() => void downloadTemplate()}>Download Template</Button>
        <label className='inline-flex cursor-pointer items-center rounded border border-slate-300 px-3 py-2 text-sm'>
          Upload Excel
          <input
            type='file'
            accept='.xlsx,.xls,.csv'
            className='hidden'
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file);
              }
            }}
          />
        </label>
      </div>
    </Card>
  );
}
