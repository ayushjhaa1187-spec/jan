'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { useStudentResult } from '@/hooks/useResults';
import { formatPercent } from '@/lib/utils';
import api from '@/lib/api';

export default function StudentReportCardPage() {
  const { examId, studentId } = useParams<{ examId: string; studentId: string }>();
  const result = useStudentResult(examId, studentId);

  const download = async () => {
    try {
      const response = await api.get(`/reports/report-card/${examId}/${studentId}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `report_card_${studentId}_${examId}.pdf`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      toast.error('Download failed');
    }
  };

  const data = result.data?.data;

  return (
    <div className='space-y-6'>
      <Card title='Student Information'>
        <p><strong>Name:</strong> {data?.student?.name ?? '-'}</p>
        <p><strong>Adm No:</strong> {data?.student?.adm_no ?? '-'}</p>
        <p><strong>Class:</strong> {data?.student?.class?.name ?? '-'} {data?.student?.class?.section ?? ''}</p>
      </Card>

      <Card title='Exam Information'>
        <p><strong>Exam:</strong> {data?.exam?.name ?? '-'}</p>
      </Card>

      <Card title='Subject-wise Performance'>
        <Table
          columns={[
            { key: 'subject', label: 'Subject', render: (row: { subjectName: string }) => row.subjectName },
            { key: 'max', label: 'Max Marks', render: (row: { maxMarks: number }) => row.maxMarks },
            { key: 'marks', label: 'Marks', render: (row: { obtainedMarks: number }) => row.obtainedMarks },
            { key: 'percentage', label: 'Percentage', render: (row: { percentage: number }) => formatPercent(row.percentage) },
            { key: 'status', label: 'Status', render: (row: { status: 'PASS' | 'FAIL' }) => <Badge status={row.status} /> },
          ]}
          data={data?.subjects ?? []}
        />
      </Card>

      <Card title='Summary'>
        <p>Total: {data?.total ?? 0}/{data?.maxTotal ?? 0}</p>
        <p>Percentage: {formatPercent(data?.percentage ?? 0)}</p>
        <p>Grade: {data?.grade ?? '-'}</p>
        <p>Remarks: {data?.remarks ?? '-'}</p>
        <div className='mt-2'><Badge status={data?.result ?? 'INCOMPLETE'} label={`Result: ${data?.result ?? 'INCOMPLETE'}`} /></div>
      </Card>

      <Button onClick={() => void download()}>Download Report Card PDF</Button>
    </div>
  );
}
