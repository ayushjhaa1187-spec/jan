'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useApproveExam, useExam, useExamMarksStatus, usePublishExam, useRejectExam, useSubmitReview } from '@/hooks/useExams';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const examId = String(params.id);
  const user = useAuthStore((state) => state.user);

  const exam = useExam(examId);
  const marksStatus = useExamMarksStatus(examId);

  const submitReview = useSubmitReview(examId);
  const approve = useApproveExam(examId);
  const reject = useRejectExam(examId);
  const publish = usePublishExam(examId);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const status = exam.data?.status ?? 'DRAFT';

  return (
    <div className='space-y-4'>
      <Card title={exam.data?.name ?? 'Exam'} actions={<Badge status={status} />}>
        <div className='grid gap-2 md:grid-cols-2'>
          <p><strong>Class:</strong> {exam.data?.class?.name} - {exam.data?.class?.section}</p>
          <p><strong>Date Range:</strong> {exam.data ? `${formatDate(exam.data.startDate)} to ${formatDate(exam.data.endDate)}` : '-'}</p>
        </div>
      </Card>

      <Card title='Marks Progress'>
        <div className='space-y-3'>
          {(marksStatus.data?.subjects ?? []).map((item: { subjectId: string; subjectName: string; teacherName: string; marksEntered: number; totalStudents: number; completionPercent: number }) => {
            const barColor = item.completionPercent >= 100 ? 'bg-green-500' : item.completionPercent > 0 ? 'bg-yellow-500' : 'bg-red-500';
            return (
              <div key={item.subjectId}>
                <p className='text-sm font-medium'>{item.subjectName} ({item.teacherName})</p>
                <div className='mt-1 h-3 rounded bg-slate-200'>
                  <div className={`h-3 rounded ${barColor}`} style={{ width: `${Math.min(item.completionPercent, 100)}%` }} />
                </div>
                <p className='text-xs text-slate-600'>{item.marksEntered}/{item.totalStudents} ({item.completionPercent}%)</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className='flex flex-wrap gap-2'>
        {user?.role === 'ExamDept' && status === 'DRAFT' ? <Button onClick={async () => { try { await submitReview.mutateAsync(); toast.success('Submitted for review'); } catch { toast.error('Failed to submit'); } }}>Submit for Review</Button> : null}
        {user?.role === 'Principal' && status === 'REVIEW' ? <>
          <Button onClick={async () => { try { await approve.mutateAsync(); toast.success('Exam approved'); } catch { toast.error('Approval failed'); } }}>Approve</Button>
          <Button variant='danger' onClick={() => setRejectOpen(true)}>Reject</Button>
        </> : null}
        {user?.role === 'Principal' && status === 'APPROVED' ? <Button onClick={async () => { try { await publish.mutateAsync(); toast.success('Exam published'); } catch { toast.error('Publish failed'); } }}>Publish Exam</Button> : null}
        {status === 'PUBLISHED' ? <Badge status='PUBLISHED' label='✓ Published' /> : null}
        <Link href={`/exams/${examId}/marks`} className='rounded border border-slate-300 px-3 py-2 text-sm'>Enter Marks</Link>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title='Reject Exam'
        footer={<><Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant='danger' disabled={reason.trim().length < 5} onClick={async () => {
          try {
            await reject.mutateAsync(reason);
            toast.success('Exam rejected');
            setRejectOpen(false);
          } catch {
            toast.error('Reject failed');
          }
        }}>Reject</Button></>}
      >
        <label className='text-sm font-medium'>Reason</label>
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} className='mt-2 h-24 w-full rounded border border-slate-300 p-2' />
      </Modal>
    </div>
  );
}
