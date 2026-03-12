'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useBulkCreateMarks, useExamSubjectMarks } from '@/hooks/useMarks';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface EntryState {
  studentId: string;
  adm_no: string;
  name: string;
  marks: number;
  maxMarks: number;
  remarks: string;
}

export default function ExamMarksPage() {
  const { id: examId } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [subjectId, setSubjectId] = useState('');
  const [entries, setEntries] = useState<EntryState[]>([]);

  const exam = useQuery({ queryKey: ['exam', examId], queryFn: async () => (await api.get(`/exams/${examId}`)).data.data });
  const classSubjects = useQuery({
    queryKey: ['class-subjects', exam.data?.classId],
    queryFn: async () => (await api.get(`/teacher-subjects/class/${exam.data.classId}`)).data.data,
    enabled: Boolean(exam.data?.classId),
    retry: 0,
  });
  const teacherSubjects = useQuery({
    queryKey: ['teacher-subjects-filtered'],
    queryFn: async () => (await api.get('/teacher-subjects')).data.data,
    enabled: user?.role === 'Teacher',
    retry: 0,
  });

  const subjects = useMemo(() => {
    const all = classSubjects.data ?? [];
    if (user?.role !== 'Teacher') return all;
    const allowed = new Set((teacherSubjects.data ?? []).map((item: { subjectId: string }) => item.subjectId));
    return all.filter((item: { subjectId: string }) => allowed.has(item.subjectId));
  }, [classSubjects.data, teacherSubjects.data, user?.role]);

  useEffect(() => {
    if (!subjectId && subjects[0]?.subjectId) {
      setSubjectId(subjects[0].subjectId);
    }
  }, [subjectId, subjects]);

  const marks = useExamSubjectMarks(examId, subjectId);
  const bulkCreate = useBulkCreateMarks();

  useEffect(() => {
    const nextEntries = (marks.data?.data?.entries ?? []).map((entry: { student: { id: string; adm_no: string; name: string }; marks: number; maxMarks: number; remarks?: string }) => ({
      studentId: entry.student.id,
      adm_no: entry.student.adm_no,
      name: entry.student.name,
      marks: entry.marks,
      maxMarks: entry.maxMarks,
      remarks: entry.remarks ?? '',
    }));
    setEntries(nextEntries);
  }, [marks.data]);

  const selectedSubject = subjects.find((item: { subjectId: string }) => item.subjectId === subjectId);
  const maxMarks = selectedSubject?.subject?.maxMarks ?? 100;

  const saveAll = async () => {
    try {
      await bulkCreate.mutateAsync({
        examId,
        subjectId,
        entries: entries.map((entry) => ({
          studentId: entry.studentId,
          marks: Number(entry.marks),
          maxMarks,
          remarks: entry.remarks,
        })),
      });
      toast.success('Marks saved successfully');
    } catch {
      toast.error('Failed to save marks');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(`/marks/template/${examId}/${subjectId}`);
      const blob = new Blob([JSON.stringify(response.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `marks_template_${examId}_${subjectId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const uploadExcel = async (file: File) => {
    try {
      await api.post(`/marks/upload/${examId}/${subjectId}`, { rows: [], filename: file.name, contentSize: file.size });
      toast.success('Upload completed');
    } catch {
      toast.error('Upload failed');
    }
  };

  const markedCount = entries.filter((item) => String(item.marks) !== '').length;

  return (
    <div className='space-y-4'>
      <Card title='Marks Entry'>
        <div className='flex flex-wrap gap-2 mb-4'>
          {subjects.map((item: { subjectId: string; subject: { name: string } }) => (
            <button key={item.subjectId} className={`px-3 py-2 rounded border ${subjectId === item.subjectId ? 'bg-[#1a365d] text-white' : 'bg-white'}`} onClick={() => setSubjectId(item.subjectId)}>
              {item.subject.name}
            </button>
          ))}
        </div>

        <div className='overflow-x-auto rounded border'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50'>
              <tr><th className='px-3 py-2 text-left'>Adm No</th><th className='px-3 py-2 text-left'>Student Name</th><th className='px-3 py-2 text-left'>Marks</th><th className='px-3 py-2 text-left'>Remarks</th><th className='px-3 py-2 text-left'>Status</th></tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const exceeded = Number(entry.marks) > maxMarks;
                return (
                  <tr key={entry.studentId} className='border-t'>
                    <td className='px-3 py-2'>{entry.adm_no}</td>
                    <td className='px-3 py-2'>{entry.name}</td>
                    <td className='px-3 py-2'>
                      <input
                        type='number'
                        min={0}
                        max={maxMarks}
                        className={`rounded border px-2 py-1 w-24 ${exceeded ? 'border-red-500' : 'border-slate-300'}`}
                        value={entry.marks}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setEntries((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, marks: value } : item));
                        }}
                      />
                      {exceeded ? <p className='text-xs text-red-600'>Exceeds max</p> : null}
                    </td>
                    <td className='px-3 py-2'>
                      <input
                        className='rounded border px-2 py-1 w-full'
                        value={entry.remarks}
                        onChange={(event) => setEntries((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, remarks: event.target.value } : item))}
                      />
                    </td>
                    <td className='px-3 py-2'>{exceeded ? 'Invalid' : 'OK'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className='text-sm text-slate-600 mt-3'>{markedCount} of {entries.length} students marked</p>

        <div className='flex flex-wrap gap-2 mt-4'>
          <Button loading={bulkCreate.isPending} onClick={() => void saveAll()}>Save All</Button>
          <Button variant='secondary' onClick={() => void downloadTemplate()}>Download Template</Button>
          <label className='inline-flex items-center rounded-md border px-3 py-2 cursor-pointer'>
            Upload Excel
            <input
              type='file'
              className='hidden'
              accept='.xlsx,.xls'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadExcel(file);
              }}
            />
          </label>
        </div>
      </Card>
    </div>
  );
}
