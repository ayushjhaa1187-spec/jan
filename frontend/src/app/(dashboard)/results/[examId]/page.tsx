'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useExamResults, useGenerateResults, usePublishResults, useResultsSummary } from '@/hooks/useResults';
import { useAuthStore } from '@/store/authStore';
import { formatPercent, downloadBlob } from '@/lib/utils';
import api from '@/lib/api';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';

export default function ExamResultsPage() {
  const params = useParams<{ examId: string }>();
  const examId = String(params.examId);
  const user = useAuthStore((state) => state.user);
  const [forceOpen, setForceOpen] = useState(false);

  const summary = useResultsSummary(examId);
  const results = useExamResults(examId);
  const generate = useGenerateResults(examId);
  const publish = usePublishResults(examId);

  const data = summary.data ?? { total: 0, passed: 0, failed: 0, incomplete: 0, average: 0, passRate: 0 };

  return (
    <div className='space-y-4'>
      <Card title='Summary'>
        <p className='text-sm'>Total: {data.total} | Passed: {data.passed} | Failed: {data.failed} | Incomplete: {data.incomplete} | Average: {formatPercent(data.average || 0)} | Pass Rate: {formatPercent(data.passRate || 0)}</p>
      </Card>

      <Card title='Grade Distribution'>
        <SubjectAveragesChart labels={['A', 'B', 'C', 'D', 'E']} values={[12, 15, 10, 5, 3]} />
      </Card>

      <Card title='Ranked Results'>
        <Table
          loading={results.isLoading}
          data={results.data ?? []}
          columns={[
            { key: 'rank', label: 'Rank' },
            { key: 'adm', label: 'Adm No', render: (row) => row.student?.enrollmentNo ?? '-' },
            { key: 'name', label: 'Name', render: (row) => `${row.student?.firstName ?? ''} ${row.student?.lastName ?? ''}` },
            { key: 'total', label: 'Total', render: (row) => String(row.total ?? '-') },
            { key: 'percentage', label: '%', render: (row) => typeof row.percentage === 'number' ? formatPercent(row.percentage) : '-' },
            { key: 'grade', label: 'Grade', render: (row) => row.grade ?? '-' },
            { key: 'status', label: 'Result', render: (row) => <Badge status={String(row.result ?? row.status ?? 'INCOMPLETE')} /> },
            { key: 'actions', label: 'Actions', render: (row) => <Link className='text-[#1a365d]' href={`/results/${examId}/${row.studentId}`}>View Report Card</Link> },
          ]}
        />
      </Card>

      <div className='flex flex-wrap gap-2'>
        {user?.role === 'ExamDept' ? <Button onClick={async () => { try { await generate.mutateAsync(); toast.success('Results generated'); } catch { toast.error('Generate failed'); } }}>Generate Results</Button> : null}
        {user?.role === 'Principal' ? <Button onClick={() => { if ((summary.data?.incomplete ?? 0) > 0) setForceOpen(true); else publish.mutate(false); }}>Publish Results</Button> : null}

        <Button variant='secondary' onClick={async () => {
          const response = await api.get(`/reports/class-report/${examId}`, { responseType: 'blob' });
          downloadBlob(response.data, `class_report_${examId}.pdf`);
        }}>Class Report PDF</Button>
        <Button variant='secondary' onClick={async () => {
          const response = await api.get(`/reports/marksheet/${examId}`, { responseType: 'blob' });
          downloadBlob(response.data, `marksheet_${examId}.pdf`);
        }}>Marksheet PDF</Button>
      </div>

      <Modal open={forceOpen} onClose={() => setForceOpen(false)} title='Force publish results?' footer={<><Button variant='secondary' onClick={() => setForceOpen(false)}>Cancel</Button><Button onClick={async () => { try { await publish.mutateAsync(true); toast.success('Results published'); setForceOpen(false); } catch { toast.error('Publish failed'); } }}>Force Publish</Button></>}>
        {summary.data?.incomplete ?? 0} students have incomplete marks. Do you still want to publish?
      </Modal>
    </div>
  );
}
