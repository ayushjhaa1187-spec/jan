'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useExamResults, useGenerateResults, usePublishResults, useResultsSummary } from '@/hooks/useResults';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';

interface ResultRow {
  rank?: number;
  student: { id: string; adm_no: string; name: string };
  total: number;
  percentage: number;
  grade: string;
  result: 'PASS' | 'FAIL';
}

export default function ExamResultsPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;
  const user = useAuthStore((state) => state.user);
  const summaryQuery = useResultsSummary(examId);
  const resultsQuery = useExamResults(examId);
  const generateMutation = useGenerateResults(examId);
  const publishMutation = usePublishResults(examId);

  const summary = summaryQuery.data as { totalStudents: number; passed: number; failed: number; incomplete: number; averagePercentage: number; passRate: number } | undefined;
  const rows = (resultsQuery.data as ResultRow[] | undefined) || [];

  const downloadBlob = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = response.data as Blob;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className='space-y-4'>
      <Card title='Summary'>
        <p>
          Total: {summary?.totalStudents || 0} | Passed: {summary?.passed || 0} | Failed: {summary?.failed || 0} | Incomplete: {summary?.incomplete || 0} |
          Average: {summary?.averagePercentage || 0}% | Pass Rate: {summary?.passRate || 0}%
        </p>
      </Card>

      <Card title='Grade Distribution'>
        <SubjectAveragesChart labels={['A', 'B', 'C', 'D', 'E']} values={[30, 22, 10, 5, 1]} />
      </Card>

      <Card title='Ranked Results'>
        <Table
          columns={[
            { key: 'rank', label: 'Rank', render: (row: ResultRow) => row.rank ?? '-' },
            { key: 'adm_no', label: 'Adm No', render: (row: ResultRow) => row.student.adm_no },
            { key: 'name', label: 'Name', render: (row: ResultRow) => row.student.name },
            { key: 'total', label: 'Total' },
            { key: 'percentage', label: '%' },
            { key: 'grade', label: 'Grade' },
            { key: 'result', label: 'Result', render: (row: ResultRow) => <Badge status={row.result} /> },
            { key: 'actions', label: 'Actions', render: (row: ResultRow) => <Link href={`/results/${examId}/${row.student.id}`} className='text-primary-light'>View Report Card</Link> },
          ]}
          data={rows}
        />
      </Card>

      <div className='flex flex-wrap gap-2'>
        {user?.role === 'ExamDept' ? <Button onClick={async () => { try { await generateMutation.mutateAsync(); toast.success('Results generated'); } catch { toast.error('Generation failed'); } }} loading={generateMutation.isPending}>Generate Results</Button> : null}
        {user?.role === 'Principal' ? <Button onClick={async () => { try { await publishMutation.mutateAsync((summary?.incomplete || 0) > 0); toast.success('Results published'); } catch { toast.error('Publish failed'); } }} loading={publishMutation.isPending}>Publish Results</Button> : null}
        <Button variant='secondary' onClick={() => void downloadBlob(`/api/reports/class-report/${examId}`, `class_report_${examId}.pdf`)}>Class Report PDF</Button>
        <Button variant='secondary' onClick={() => void downloadBlob(`/api/reports/marksheet/${examId}`, `marksheet_${examId}.pdf`)}>Marksheet PDF</Button>
      </div>
    </div>
  );
}
