'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStudent, useTransferClass } from '@/hooks/useStudents'
import { useState } from 'react'

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [classId, setClassId] = useState('')
  const student = useStudent(id)
  const results = useQuery({ queryKey: ['student-results', id], queryFn: async () => (await api.get(`/students/${id}/results`)).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const transfer = useTransferClass(id)

  const s = student.data?.data

  return <div className="space-y-4"><Card title="Student Info"><div className="grid md:grid-cols-2 gap-3"><p><strong>Name:</strong> {s?.name ?? '-'}</p><p><strong>Adm No:</strong> {s?.adm_no ?? '-'}</p><p><strong>Email:</strong> {s?.email ?? '-'}</p><p><strong>Phone:</strong> {s?.phone ?? '-'}</p><p><strong>Class:</strong> {s?.class?.name ?? '-'}</p></div></Card>
    <Card title="Results History"><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Exam</th><th>Total</th><th>%</th><th>Grade</th><th>Result</th></tr></thead><tbody>{(results.data?.data ?? []).map((r: { id: string; examName: string; total: number; percentage: number; grade: string; result: string }) => <tr key={r.id}><td>{r.examName}</td><td>{r.total}</td><td>{r.percentage.toFixed(2)}</td><td>{r.grade}</td><td>{r.result}</td></tr>)}</tbody></table></div></Card>
    <Card title="Transfer Class"><div className="flex gap-2"><select className="rounded border px-3 py-2" value={classId} onChange={(e) => setClassId(e.target.value)}><option value="">Select class</option>{(classes.data?.data ?? []).map((c: { id: string; name: string; section: string }) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}</select><Button loading={transfer.isPending} onClick={async () => { try { await transfer.mutateAsync(classId); toast.success('Class transferred') } catch { toast.error('Transfer failed') } }}>Transfer</Button></div></Card>
  </div>
}
