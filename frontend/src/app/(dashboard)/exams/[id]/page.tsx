'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useApproveExam, useExam, useExamMarksStatus, usePublishExam, useRejectExam, useSubmitReview } from '@/hooks/useExams';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

const rejectSchema = z.object({ reason: z.string().min(5) });
type RejectForm = z.infer<typeof rejectSchema>;

interface MarksStatusSubject {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  marksEntered: number;
  totalStudents: number;
  completionPercent: number;
}

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = params.id;
  const user = useAuthStore((state) => state.user);
  const [rejectOpen, setRejectOpen] = useState(false);

  const examQuery = useExam(examId);
  const marksStatusQuery = useExamMarksStatus(examId);
  const submitReview = useSubmitReview(examId);
  const approveExam = useApproveExam(examId);
  const rejectExam = useRejectExam(examId);
  const publishExam = usePublishExam(examId);

  const rejectForm = useForm<RejectForm>({ resolver: zodResolver(rejectSchema), defaultValues: { reason: '' } });

  const subjects = useMemo(() => {
    const data = marksStatusQuery.data as { subjects?: MarksStatusSubject[] } | undefined;
    return data?.subjects || [];
  }, [marksStatusQuery.data]);

  const runAction = async (callback: () => Promise<unknown>, successMsg: string) => {
    try {
      await callback();
      toast.success(successMsg);
    } catch {
      toast.error('Operation failed');
    }
  };

  return (
    <div className='space-y-4'>
      <Card title={examQuery.data?.name || 'Exam'}>
        <div className='flex flex-wrap items-center gap-3'>
          <Badge status={examQuery.data?.status || 'DRAFT'} />
          <span>{examQuery.data?.class?.name} {examQuery.data?.class?.section}</span>
          <span>{formatDate(examQuery.data?.startDate || new Date())} - {formatDate(examQuery.data?.endDate || new Date())}</span>
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          {user?.role === 'ExamDept' && examQuery.data?.status === 'DRAFT' ? (
            <Button onClick={() => void runAction(() => submitReview.mutateAsync(), 'Submitted for review')} loading={submitReview.isPending}>Submit for Review</Button>
          ) : null}
          {user?.role === 'Principal' && examQuery.data?.status === 'REVIEW' ? (
            <>
              <Button onClick={() => void runAction(() => approveExam.mutateAsync(), 'Exam approved')} loading={approveExam.isPending}>Approve</Button>
              <Button variant='danger' onClick={() => setRejectOpen(true)}>Reject</Button>
            </>
          ) : null}
          {user?.role === 'Principal' && examQuery.data?.status === 'APPROVED' ? (
            <Button onClick={() => void runAction(() => publishExam.mutateAsync(), 'Exam published')} loading={publishExam.isPending}>Publish Exam</Button>
          ) : null}
          {examQuery.data?.status === 'PUBLISHED' ? <Badge status='PUBLISHED' label='✓ Published' /> : null}
          <Link href={`/exams/${examId}/marks`} className='rounded bg-primary-light px-3 py-2 text-sm text-white'>Enter Marks</Link>
        </div>
      </Card>

      <Card title='Marks Progress'>
        <div className='space-y-3'>
          {subjects.map((subject) => (
            <div key={subject.subjectId}>
              <div className='mb-1 flex items-center justify-between text-sm'>
                <span>{subject.subjectName} ({subject.teacherName})</span>
                <span>{subject.marksEntered}/{subject.totalStudents} ({subject.completionPercent}%)</span>
              </div>
              <div className='h-3 rounded bg-slate-200'>
                <div
                  className={`h-3 rounded ${subject.completionPercent === 100 ? 'bg-green-500' : subject.completionPercent > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, Math.min(100, subject.completionPercent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title='Reject Exam'
        footer={<><Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant='danger' onClick={rejectForm.handleSubmit(async (values) => {
          try {
            await rejectExam.mutateAsync(values.reason);
            toast.success('Exam rejected');
            setRejectOpen(false);
            rejectForm.reset();
          } catch {
            toast.error('Reject failed');
          }
        })} loading={rejectExam.isPending}>Reject</Button></>}
      >
        <textarea className='min-h-24 w-full rounded-md border border-slate-300 p-2' placeholder='Reason' {...rejectForm.register('reason')} />
        {rejectForm.formState.errors.reason ? <p className='mt-1 text-xs text-danger'>{rejectForm.formState.errors.reason.message}</p> : null}
      </Modal>
    </div>
  );
}
