'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface MarkDraft {
  studentId: string;
  admNo: string;
  name: string;
  marks: string;
  remarks: string;
  maxMarks: number;
}

export default function ExamMarksEntryPage() {
  const params = useParams<{ id: string }>();
  const examId = String(params.id);
  const user = useAuthStore((state) => state.user);

  const exam = useQuery({ queryKey: ['exam', examId], queryFn: async () => (await api.get(`/exams/${examId}`)).data.data });
  const classId = exam.data?.classId;

  const classSubjects = useQuery({
    queryKey: ['teacher-subjects-class', classId],
    queryFn: async () => (await api.get(`/teacher-subjects/class/${classId}`)).data.data,
    enabled: Boolean(classId),
  });

  const teacherSubjects = useQuery({
    queryKey: ['teacher-subjects-teacher', user?.id],
    queryFn: async () => (await api.get(`/teacher-subjects/teacher/${user?.id}`)).data.data,
    enabled: user?.role === 'Teacher' && Boolean(user?.id),
  });

  const subjects = useMemo(() => {
    if (user?.role === 'Teacher') {
      return teacherSubjects.data ?? [];
    }
    return classSubjects.data ?? [];
  }, [classSubjects.data, teacherSubjects.data, user?.role]);

  const [subjectId, setSubjectId] = useState('');
  const marks = useExamSubjectMarks(examId, subjectId);
  const bulkSave = useBulkCreateMarks();

  const students = useQuery({
    queryKey: ['exam-students', examId],
    queryFn: async () => (await api.get(`/exams/${examId}/students`)).data.data,
    enabled: Boolean(examId),
  });

  const drafts = useMemo<MarkDraft[]>(() => {
    const existing = marks.data?.entries ?? [];
    return (students.data ?? []).map((student: { id: string; enrollmentNo: string; firstName: string; lastName: string }) => {
      const found = existing.find((entry: { student: { id: string }; marks: number; remarks?: string; maxMarks?: number }) => entry.student.id === student.id);
      return {
        studentId: student.id,
        admNo: student.enrollmentNo,
        name: `${student.firstName} ${student.lastName}`,
        marks: found ? String(found.marks) : '',
        remarks: found?.remarks ?? '',
        maxMarks: found?.maxMarks ?? 100,
      };
    });
  }, [marks.data?.entries, students.data]);

  const [state, setState] = useState<Record<string, { marks: string; remarks: string }>>({});

  const currentRows = drafts.map((item) => ({
    ...item,
    marks: state[item.studentId]?.marks ?? item.marks,
    remarks: state[item.studentId]?.remarks ?? item.remarks,
  }));

  const saveAll = async () => {
    if (!subjectId) {
      toast.error('Select a subject first');
      return;
    }

    const entries = currentRows
      .filter((row) => row.marks !== '')
      .map((row) => ({
        studentId: row.studentId,
        marks: Number(row.marks),
        remarks: row.remarks,
        maxMarks: row.maxMarks,
      }));

    try {
      await bulkSave.mutateAsync({ examId, subjectId, entries });
      toast.success('Marks saved successfully');
    } catch {
      toast.error('Saving marks failed');
    }
  };

  return (
    <div className='space-y-4'>
      <Card title='Marks Entry'>
        <div className='flex flex-wrap gap-2'>
          {(subjects ?? []).map((item: { subjectId: string; subject?: { name: string } }) => (
            <button
              key={item.subjectId}
              className={`rounded px-3 py-1 text-sm ${subjectId === item.subjectId ? 'bg-[#1a365d] text-white' : 'bg-slate-100'}`}
              onClick={() => setSubjectId(item.subjectId)}
            >
              {item.subject?.name ?? item.subjectId}
            </button>
          ))}
        </div>
      </Card>

      <Card title='Student Marks'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='bg-slate-50'>
                <th className='border p-2 text-left'>Adm No</th>
                <th className='border p-2 text-left'>Student</th>
                <th className='border p-2 text-left'>Marks</th>
                <th className='border p-2 text-left'>Remarks</th>
                <th className='border p-2 text-left'>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((row) => {
                const numeric = Number(row.marks || '0');
                const invalid = numeric > row.maxMarks;
                return (
                  <tr key={row.studentId}>
                    <td className='border p-2'>{row.admNo}</td>
                    <td className='border p-2'>{row.name}</td>
                    <td className='border p-2'>
                      <input
                        value={row.marks}
                        onChange={(event) => setState((prev) => ({ ...prev, [row.studentId]: { marks: event.target.value, remarks: prev[row.studentId]?.remarks ?? row.remarks } }))}
                        type='number'
                        min={0}
                        max={row.maxMarks}
                        className={`h-9 w-28 rounded border px-2 ${invalid ? 'border-red-500' : 'border-slate-300'}`}
                      />
                    </td>
                    <td className='border p-2'>
                      <input
                        value={row.remarks}
                        onChange={(event) => setState((prev) => ({ ...prev, [row.studentId]: { marks: prev[row.studentId]?.marks ?? row.marks, remarks: event.target.value } }))}
                        className='h-9 w-full rounded border border-slate-300 px-2'
                      />
                    </td>
                    <td className='border p-2 text-xs'>{invalid ? 'Exceeds max marks' : 'Valid'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <p className='text-sm text-slate-600'>
            {currentRows.filter((row) => row.marks !== '').length} of {currentRows.length} students marked
          </p>
          <Button onClick={saveAll} loading={bulkSave.isPending}>Save All</Button>
          <Button variant='secondary' onClick={async () => {
            if (!subjectId) return;
            const { data } = await api.get(`/marks/template/${examId}/${subjectId}`);
            const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `marks_template_${examId}_${subjectId}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Download Template</Button>
        </div>
      </Card>
    </div>
  );
}
