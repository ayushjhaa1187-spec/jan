'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { SubjectAveragesChart } from '@/components/charts/SubjectAveragesChart'
import { useAuthStore } from '@/store/authStore'
import { useExamResults, useGenerateResults, usePublishResults, useResultsSummary } from '@/hooks/useResults'

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>()
  const { user } = useAuthStore()
  const [warningOpen, setWarningOpen] = useState(false)
  const summary = useResultsSummary(examId)
  const results = useExamResults(examId)
  const generate = useGenerateResults(examId)
  const publish = usePublishResults(examId)

  const stats = summary.data?.data ?? { total: 0, passed: 0, failed: 0, incomplete: 0, averagePercent: 0 }
  const rows: Array<{ studentId: string; rank: number; name: string; adm_no: string; percentage: number; grade: string; result: string }> = results.data?.data ?? []

  return <div className="space-y-4"><div className="grid md:grid-cols-5 gap-3"><StatCard title="Total" value={stats.total} /><StatCard title="Passed" value={stats.passed} /><StatCard title="Failed" value={stats.failed} /><StatCard title="Incomplete" value={stats.incomplete} /><StatCard title="Average" value={`${Number(stats.averagePercent ?? 0).toFixed(2)}%`} /></div>
    <Card title="Grade Distribution"><SubjectAveragesChart labels={(summary.data?.data?.gradeDistribution?.labels ?? []) as string[]} values={(summary.data?.data?.gradeDistribution?.values ?? []) as number[]} /></Card>
    <Card title="Ranked Results" actions={<div className="flex gap-2">{user?.role === 'ExamDept' && <Button loading={generate.isPending} onClick={async () => { try { await generate.mutateAsync(); toast.success('Results generated') } catch { toast.error('Failed to generate') } }}>Generate Results</Button>}{user?.role === 'Principal' && <Button loading={publish.isPending} onClick={() => stats.incomplete > 0 ? setWarningOpen(true) : publish.mutateAsync(false)}>Publish Results</Button>}<Button variant="secondary" onClick={() => toast.info('Downloading class report...')}>Download Class Report</Button><Button variant="secondary" onClick={() => toast.info('Downloading marksheet PDF...')}>Marksheet PDF</Button></div>}>
      <div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Rank</th><th>Name</th><th>Adm No</th><th>%</th><th>Grade</th><th>Status</th><th /></tr></thead><tbody>{rows.map((r) => <tr key={r.studentId}><td>{r.rank}</td><td>{r.name}</td><td>{r.adm_no}</td><td>{r.percentage.toFixed(2)}</td><td>{r.grade}</td><td><Badge status={r.result} /></td><td><Link href={`/results/${examId}/${r.studentId}`}>View</Link></td></tr>)}</tbody></table></div>
    </Card>
    <Modal isOpen={warningOpen} onClose={() => setWarningOpen(false)} title="Incomplete Results" footer={<><Button variant="secondary" onClick={() => setWarningOpen(false)}>Cancel</Button><Button onClick={async () => { try { await publish.mutateAsync(true); toast.success('Published with force'); setWarningOpen(false) } catch { toast.error('Failed') } }}>Publish Anyway</Button></>}><p>{stats.incomplete} students are incomplete. Publish anyway?</p></Modal>
  </div>
}
