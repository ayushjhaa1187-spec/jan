'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useApproveExam, useExam, useExamMarksStatus, usePublishExam, useRejectExam, useSubmitReview } from '@/hooks/useExams'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const user = useAuthStore((state) => state.user)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const exam = useExam(id)
  const marksStatus = useExamMarksStatus(id)
  const submitReview = useSubmitReview()
  const approveExam = useApproveExam()
  const rejectExam = useRejectExam()
  const publishExam = usePublishExam()

  const examData = exam.data?.data

  const perform = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action()
      toast.success(message)
    } catch {
      toast.error('Operation failed')
    }
  }

  return (
    <div className='space-y-4'>
      <Card title={examData?.name || 'Exam'} actions={<Badge status={examData?.status || 'DRAFT'} />}>
        <p><strong>Class:</strong> {examData?.class?.name} - {examData?.class?.section}</p>
        <p><strong>Dates:</strong> {new Date(examData?.startDate || Date.now()).toLocaleDateString()} - {new Date(examData?.endDate || Date.now()).toLocaleDateString()}</p>

        <div className='mt-4 flex gap-2'>
          {user?.role === 'ExamDept' && examData?.status === 'DRAFT' ? <Button onClick={() => perform(() => submitReview.mutateAsync({ id }), 'Submitted for review')}>Submit for Review</Button> : null}
          {user?.role === 'Principal' && examData?.status === 'REVIEW' ? <>
            <Button onClick={() => perform(() => approveExam.mutateAsync({ id }), 'Exam approved')}>Approve</Button>
            <Button variant='danger' onClick={() => setRejectOpen(true)}>Reject</Button>
          </> : null}
          {user?.role === 'Principal' && examData?.status === 'APPROVED' ? <Button onClick={() => perform(() => publishExam.mutateAsync({ id }), 'Exam published')}>Publish Exam</Button> : null}
          {examData?.status === 'PUBLISHED' ? <Badge status='PUBLISHED' label='✓ Published' /> : null}
          <Link className='rounded bg-[#2b6cb0] px-3 py-2 text-sm text-white' href={`/exams/${id}/marks`}>Enter Marks</Link>
        </div>
      </Card>

      <Card title='Marks Progress'>
        <div className='space-y-4'>
          {(marksStatus.data?.data?.subjects as Array<{ subjectName: string; teacher: string; marksEntered: number; totalStudents: number; completionPercent: number }> | undefined)?.map((item) => {
            const color = item.completionPercent === 100 ? 'bg-green-500' : item.completionPercent > 0 ? 'bg-yellow-500' : 'bg-red-500'
            return (
              <div key={item.subjectName}>
                <p className='text-sm font-medium'>{item.subjectName} ({item.teacher})</p>
                <div className='mt-1 h-3 w-full rounded bg-slate-200'>
                  <div className={`h-3 rounded ${color}`} style={{ width: `${item.completionPercent}%` }} />
                </div>
                <p className='text-xs text-slate-500'>{item.marksEntered}/{item.totalStudents} ({item.completionPercent}%)</p>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title='Reject Exam' footer={<><Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant='danger' onClick={() => perform(() => rejectExam.mutateAsync({ id, payload: { reason } }), 'Exam rejected')} disabled={reason.trim().length < 5}>Reject</Button></>}>
        <Input label='Reason' value={reason} onChange={(event) => setReason(event.target.value)} helperText='Minimum 5 characters required.' />
      </Modal>
    </div>
  )
}
