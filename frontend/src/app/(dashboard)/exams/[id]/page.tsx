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

interface ExamRes { data: { id: string; name: string; status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'; marksStatus?: Array<{ subject: { id: string; name: string }; filled: number; total: number }> } }

export default function ExamDetailPage() {
  const id = useParams<{ id: string }>().id
  const role = useAuthStore((s) => s.user?.role)
  const [openReject, setOpenReject] = useState(false)
  const [reason, setReason] = useState('')
  const qc = useQueryClient()
  const exam = useQuery<ExamRes>({ queryKey: ['exam', id], queryFn: async () => (await api.get(`/exams/${id}`)).data })
  const action = useMutation({ mutationFn: async (payload: { action: string; reason?: string }) => (await api.patch(`/exams/${id}/workflow`, payload)).data, onSuccess: async () => { toast.success('Updated'); setOpenReject(false); setReason(''); await qc.invalidateQueries({ queryKey: ['exam', id] }) }, onError: () => toast.error('Workflow update failed') })
  const status = exam.data?.data.status
  return <div className="space-y-4"><Card title={exam.data?.data.name ?? 'Exam'} actions={<Badge status={status ?? 'DRAFT'} />}>{(exam.data?.data.marksStatus ?? []).map((m) => <div key={m.subject.id} className="mb-3"><div className="mb-1 flex justify-between text-sm"><span>{m.subject.name}</span><span>{m.filled}/{m.total}</span></div><div className="h-2 rounded bg-gray-200"><div className="h-2 rounded bg-[#2b6cb0]" style={{ width: `${m.total ? (m.filled / m.total) * 100 : 0}%` }} /></div></div>)}</Card><div className="flex flex-wrap gap-2"><Link href={`/exams/${id}/marks`}><Button>Enter Marks</Button></Link>{role === 'ExamDept' && status === 'DRAFT' ? <Button onClick={() => action.mutate({ action: 'SUBMIT_REVIEW' })}>Submit for Review</Button> : null}{role === 'Principal' && status === 'REVIEW' ? <><Button onClick={() => action.mutate({ action: 'APPROVE' })}>Approve</Button><Button variant="danger" onClick={() => setOpenReject(true)}>Reject</Button></> : null}{role === 'Principal' && status === 'APPROVED' ? <Button onClick={() => action.mutate({ action: 'PUBLISH' })}>Publish</Button> : null}{status === 'PUBLISHED' ? <span className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">Published</span> : null}</div><Modal isOpen={openReject} onClose={() => setOpenReject(false)} title="Reject Exam" footer={<><Button variant="secondary" onClick={() => setOpenReject(false)}>Cancel</Button><Button variant="danger" onClick={() => action.mutate({ action: 'REJECT', reason })}>Reject</Button></>}><textarea className="w-full rounded border p-2" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" /></Modal></div>
}
