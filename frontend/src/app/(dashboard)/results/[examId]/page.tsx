'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useGenerateResults, usePublishResults, useResultsSummary, useExamResults } from '@/hooks/useResults';
import { useAuthStore } from '@/store/authStore';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';
import { useState } from 'react';
import api from '@/lib/api';

export default function ExamResultsPage() {
  const { examId } = useParams<{ examId: string }>();
  const [confirm, setConfirm] = useState(false);
  const user = useAuthStore((state) => state.user);
  const summary = useResultsSummary(examId);
  const results = useExamResults(examId);
  const generate = useGenerateResults();
  const publish = usePublishResults();

  const downloadBlob = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      toast.error('Download failed');
    }
  };

  const summaryData = summary.data?.data ?? { totalStudents: 0, passed: 0, failed: 0, incomplete: 0, average: 0, passRate: 0 };

  return (
    <div className='space-y-6'>
      <Card title='Summary'>
        <p className='text-sm'>Total: {summaryData.totalStudents} | Passed: {summaryData.passed} | Failed: {summaryData.failed} | Incomplete: {summaryData.incomplete} | Average: {summaryData.average}% | Pass Rate: {summaryData.passRate}%</p>
      </Card>

      <Card title='Grade Distribution'>
        <SubjectAveragesChart labels={['A', 'B', 'C', 'D', 'F']} values={[10, 20, 30, 25, 15]} />
      </Card>

      <Card title='Results'>
        <Table columns={[
          { key: 'rank', label: 'Rank', render: (row: { rank?: number }) => row.rank ?? '-' },
          { key: 'adm_no', label: 'Adm No', render: (row: { student?: { enrollmentNo?: string } }) => row.student?.enrollmentNo ?? '-' },
          { key: 'name', label: 'Name', render: (row: { student?: { firstName?: string; lastName?: string } }) => `${row.student?.firstName ?? ''} ${row.student?.lastName ?? ''}` },
          { key: 'total', label: 'Total', render: () => '-' },
          { key: 'percent', label: '%', render: () => '-' },
          { key: 'grade', label: 'Grade', render: () => '-' },
          { key: 'status', label: 'Result', render: (row: { status: string }) => <Badge status={row.status} /> },
          { key: 'actions', label: 'Actions', render: (row: { studentId: string }) => <Link className='text-blue-700' href={`/results/${examId}/${row.studentId}`}>View Report Card</Link> },
        ]} data={(results.data?.data ?? []).map((item: Record<string, unknown>, index: number) => ({ ...item, rank: index + 1 }))} />
      </Card>

      <div className='flex flex-wrap gap-2'>
        {user?.role === 'ExamDept' ? <Button loading={generate.isPending} onClick={async () => { try { await generate.mutateAsync({ examId }); toast.success('Results generated'); } catch { toast.error('Generate failed'); } }}>Generate Results</Button> : null}
        {user?.role === 'Principal' ? <Button loading={publish.isPending} onClick={() => { if (summaryData.incomplete > 0) setConfirm(true); else void publish.mutateAsync({ examId }); }}>Publish Results</Button> : null}
        <Button variant='secondary' onClick={() => void downloadBlob(`/reports/class-report/${examId}`, `class_report_${examId}.pdf`)}>Class Report PDF</Button>
        <Button variant='secondary' onClick={() => void downloadBlob(`/reports/marksheet/${examId}`, `marksheet_${examId}.pdf`)}>Marksheet PDF</Button>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title='Force Publish Results'
        footer={<><Button variant='secondary' onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={async () => { try { await publish.mutateAsync({ examId, force: true }); toast.success('Results published'); setConfirm(false); } catch { toast.error('Publish failed'); } }}>Force Publish</Button></>}
      >
        <p>{summaryData.incomplete} students have incomplete marks. Force publish?</p>
      </Modal>
    </div>
  );
}
