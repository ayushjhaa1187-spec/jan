'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface ExamResponse { data: { id: string; name: string; status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'; class?: { name: string; section: string } } }
interface MarksStatusResponse { data: Array<{ subjectId: string; subjectName: string; filled: number; total: number }> }

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((state) => state.user)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const exam = useQuery<ExamResponse>({ queryKey: ['exam', id], queryFn: async () => (await api.get(`/exams/${id}`)).data })
  const marksStatus = useQuery<MarksStatusResponse>({ queryKey: ['exam', id, 'marks-status'], queryFn: async () => (await api.get(`/exams/${id}/marks-status`)).data })

  const transition = useMutation({
    mutationFn: async (payload: { action: string; reason?: string }) => (await api.patch(`/exams/${id}/workflow`, payload)).data,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['exam', id] }); toast.success('Status updated') }
  })

  const status = exam.data?.data.status

  return (
    <div className='space-y-4'>
      <Card title={exam.data?.data.name ?? 'Exam'} actions={<Badge status={status ?? 'DRAFT'} />}>
        <p className='text-sm text-gray-600'>Class: {exam.data?.data.class?.name} {exam.data?.data.class?.section}</p>
        <div className='mt-4 space-y-3'>
          {(marksStatus.data?.data ?? []).map((row) => {
            const percentage = row.total > 0 ? Math.round((row.filled / row.total) * 100) : 0
            return <div key={row.subjectId}><div className='mb-1 flex justify-between text-sm'><span>{row.subjectName}</span><span>{row.filled}/{row.total}</span></div><div className='h-2 rounded bg-gray-200'><div className='h-2 rounded bg-[#2b6cb0]' style={{ width: `${percentage}%` }} /></div></div>
          })}
        </div>
      </Card>

      <Card title='Workflow'>
        <div className='flex flex-wrap gap-2'>
          {user?.role === 'ExamDept' && status === 'DRAFT' && <Button onClick={() => void transition.mutateAsync({ action: 'SUBMIT_REVIEW' })}>Submit for Review</Button>}
          {user?.role === 'Principal' && status === 'REVIEW' && <><Button onClick={() => void transition.mutateAsync({ action: 'APPROVE' })}>Approve</Button><Button variant='danger' onClick={() => setRejectOpen(true)}>Reject</Button></>}
          {user?.role === 'Principal' && status === 'APPROVED' && <Button onClick={() => void transition.mutateAsync({ action: 'PUBLISH' })}>Publish</Button>}
          {status === 'PUBLISHED' && <div className='rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800'>Published</div>}
          <Link href={`/exams/${id}/marks`}><Button variant='secondary'>Enter Marks</Button></Link>
        </div>
      </Card>

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title='Reject Exam' footer={<><Button variant='secondary' onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant='danger' loading={transition.isPending} onClick={() => void transition.mutateAsync({ action: 'REJECT', reason }).then(() => setRejectOpen(false))}>Reject</Button></>}>
        <textarea className='w-full rounded-lg border border-gray-300 p-3' rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder='Enter rejection reason' />
      </Modal>
    </div>
  )
}
