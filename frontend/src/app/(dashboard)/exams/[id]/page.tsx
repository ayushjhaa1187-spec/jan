'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'

interface SubjectProgress { subjectId: string; subjectName: string; filled: number; total: number }
interface ExamDetail { id: string; name: string; status: string; class?: { name: string; section: string }; progress: SubjectProgress[] }

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const role = useAuthStore((state) => state.user?.role)
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')

  const exam = useQuery({ queryKey: ['exam', id], queryFn: async () => (await api.get<{ data: ExamDetail }>(`/exams/${id}`)).data })
  const action = useMutation({ mutationFn: async ({ endpoint, payload }: { endpoint: string; payload?: Record<string, string> }) => (await api.patch(endpoint, payload)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['exam', id] }) } })

  const data = exam.data?.data

  return (
    <div className="space-y-4">
      <Card title={data?.name ?? 'Exam'} actions={<Badge status={data?.status ?? 'DRAFT'} />}>
        <p className="text-sm text-gray-600">Class: {data?.class ? `${data.class.name} - ${data.class.section}` : '-'}</p>
      </Card>
      <Card title="Marks Progress" actions={<Link href={`/exams/${id}/marks`} className="text-sm text-[#2b6cb0]">Enter Marks</Link>}>
        <div className="space-y-3">
          {(data?.progress ?? []).map((p) => {
            const percent = p.total > 0 ? Math.round((p.filled / p.total) * 100) : 0
            return (
              <div key={p.subjectId}>
                <div className="mb-1 flex justify-between text-sm"><span>{p.subjectName}</span><span>{p.filled}/{p.total}</span></div>
                <div className="h-2 rounded bg-gray-200"><div className="h-2 rounded bg-[#2b6cb0]" style={{ width: `${percent}%` }} /></div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="Workflow">
        <div className="flex flex-wrap gap-2">
          {role === 'ExamDept' && data?.status === 'DRAFT' ? <Button onClick={() => void action.mutateAsync({ endpoint: `/exams/${id}/submit-review` })}>Submit for Review</Button> : null}
          {role === 'Principal' && data?.status === 'REVIEW' ? <><Button onClick={() => void action.mutateAsync({ endpoint: `/exams/${id}/approve` })}>Approve</Button><Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button></> : null}
          {role === 'Principal' && data?.status === 'APPROVED' ? <Button onClick={() => void action.mutateAsync({ endpoint: `/exams/${id}/publish` })}>Publish</Button> : null}
          {data?.status === 'PUBLISHED' ? <div className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">Published</div> : null}
        </div>
      </Card>

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Exam" footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setRejectOpen(false)}>Cancel</Button><Button variant="danger" onClick={() => void action.mutateAsync({ endpoint: `/exams/${id}/reject`, payload: { reason } }).then(() => setRejectOpen(false))}>Reject</Button></div>}>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-24 w-full rounded-lg border p-2" placeholder="Reason" />
      </Modal>
    </div>
  )
}
