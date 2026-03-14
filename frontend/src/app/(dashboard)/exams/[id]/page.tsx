'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/store/authStore'
import { useApproveExam, useExam, useExamMarksStatus, usePublishExam, useRejectExam, useSubmitReview } from '@/hooks/useExams'

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const exam = useExam(id)
  const marksStatus = useExamMarksStatus(id)
  const submitReview = useSubmitReview()
  const approve = useApproveExam()
  const reject = useRejectExam()
  const publish = usePublishExam()

  const status: string = exam.data?.data?.status ?? 'DRAFT'
  const subjects: Array<{ subjectId: string; subjectName: string; filled: number; total: number }> = marksStatus.data?.data ?? []

  return (
    <div className="space-y-4">
      <Card title={exam.data?.data?.name ?? 'Exam'} actions={<Badge status={status} />}>
        <div className="space-y-3">
          {subjects.map((s) => {
            const pct = s.total > 0 ? Math.round((s.filled / s.total) * 100) : 0
            return (
              <div key={s.subjectId}>
                <div className="flex justify-between text-sm">
                  <span>{s.subjectName}</span>
                  <span>{s.filled}/{s.total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div className="h-full bg-[#2b6cb0] rounded" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {status === 'PUBLISHED' && (
        <div className="rounded-lg bg-green-100 text-green-800 px-4 py-3">Published</div>
      )}

      <div className="flex flex-wrap gap-2">
        {user?.role === 'ExamDept' && status === 'DRAFT' && (
          <Button
            loading={submitReview.isPending}
            onClick={async () => {
              try { await submitReview.mutateAsync({ id }); toast.success('Submitted for review') } catch { toast.error('Failed') }
            }}
          >
            Submit for Review
          </Button>
        )}

        {user?.role === 'Principal' && status === 'REVIEW' && (
          <>
            <Button
              loading={approve.isPending}
              onClick={async () => {
                try { await approve.mutateAsync({ id }); toast.success('Approved') } catch { toast.error('Failed') }
              }}
            >
              Approve
            </Button>
            <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button>
          </>
        )}

        {user?.role === 'Principal' && status === 'APPROVED' && (
          <Button
            loading={publish.isPending}
            onClick={async () => {
              try { await publish.mutateAsync({ id }); toast.success('Published') } catch { toast.error('Failed') }
            }}
          >
            Publish
          </Button>
        )}

        <Link href={`/exams/${id}/marks`}>
          <Button variant="secondary">Enter Marks</Button>
        </Link>
      </div>

      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject exam"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              loading={reject.isPending}
              onClick={async () => {
                try { await reject.mutateAsync({ id, payload: { reason } }); toast.success('Rejected'); setRejectOpen(false); setReason('') } catch { toast.error('Failed') }
              }}
            >
              Reject
            </Button>
          </>
        )}
      >
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded border p-2" rows={4} placeholder="Reason" />
      </Modal>
    </div>
  )
}
