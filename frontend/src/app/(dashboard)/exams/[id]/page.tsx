'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useApproveExam, useExam, useExamMarksStatus, usePublishExam, useRejectExam, useSubmitReview } from '@/hooks/useExams';
import { useAuthStore } from '@/store/authStore';

const rejectSchema = z.object({ reason: z.string().min(5) });
type RejectPayload = z.infer<typeof rejectSchema>;

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [rejectOpen, setRejectOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const exam = useExam(id);
  const marksStatus = useExamMarksStatus(id);
  const submitReview = useSubmitReview();
  const approve = useApproveExam();
  const reject = useRejectExam();
  const publish = usePublishExam();

  const rejectForm = useForm<RejectPayload>({ resolver: zodResolver(rejectSchema) });

  const examData = exam.data?.data;
  const status = examData?.status;

  return (
    <div className='space-y-6'>
      <Card title={examData?.name || 'Exam'} description={`${examData?.class?.name ?? ''} ${examData?.class?.section ?? ''}`} actions={<Badge status={status ?? 'DRAFT'} />}>
        <div className='flex gap-2 flex-wrap'>
          {user?.role === 'ExamDept' && status === 'DRAFT' ? (
            <Button loading={submitReview.isPending} onClick={async () => { try { await submitReview.mutateAsync({ id }); toast.success('Submitted for review'); } catch { toast.error('Failed'); } }}>Submit for Review</Button>
          ) : null}
          {user?.role === 'Principal' && status === 'REVIEW' ? (
            <>
              <Button loading={approve.isPending} onClick={async () => { try { await approve.mutateAsync({ id }); toast.success('Exam approved'); } catch { toast.error('Failed'); } }}>Approve</Button>
              <Button variant='danger' onClick={() => setRejectOpen(true)}>Reject</Button>
            </>
          ) : null}
          {user?.role === 'Principal' && status === 'APPROVED' ? (
            <Button loading={publish.isPending} onClick={async () => { try { await publish.mutateAsync({ id }); toast.success('Exam published'); } catch { toast.error('Failed'); } }}>Publish Exam</Button>
          ) : null}
          {status === 'PUBLISHED' ? <Badge status='PUBLISHED' label='✓ Published' /> : null}
          <Button variant='secondary'><Link href={`/exams/${id}/marks`}>Enter Marks</Link></Button>
        </div>
      </Card>

      <Card title='Marks Progress'>
        <div className='space-y-3'>
          {(marksStatus.data?.data?.subjects ?? []).map((item: { subjectId: string; subjectName: string; teacher: string; marksEntered: number; totalStudents: number; completionPercent: number }) => {
            const percent = item.completionPercent;
            const color = percent >= 100 ? 'bg-green-500' : percent > 0 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={item.subjectId}>
                <p className='text-sm font-medium'>{item.subjectName} ({item.teacher})</p>
                <div className='h-2 rounded bg-slate-200 mt-1 overflow-hidden'>
                  <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
                </div>
                <p className='text-xs text-slate-500 mt-1'>{item.marksEntered}/{item.totalStudents} ({percent}%)</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title='Reject Exam'
        footer={<><Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button><Button loading={reject.isPending} onClick={rejectForm.handleSubmit(async (values) => { try { await reject.mutateAsync({ id, payload: values }); toast.success('Exam rejected'); setRejectOpen(false); } catch { toast.error('Failed'); } })}>Reject</Button></>}
      >
        <textarea className='w-full min-h-28 rounded border px-3 py-2' placeholder='Enter reason' {...rejectForm.register('reason')} />
        {rejectForm.formState.errors.reason ? <p className='text-xs text-red-600 mt-1'>{rejectForm.formState.errors.reason.message}</p> : null}
      </Modal>
    </div>
  );
}
