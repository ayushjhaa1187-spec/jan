'use client';

import { useParams } from 'next/navigation';
import { useStudentResult } from '@/hooks/useResults';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { formatPercent, downloadBlob } from '@/lib/utils';
import api from '@/lib/api';

export default function StudentReportCardPage() {
  const params = useParams<{ examId: string; studentId: string }>();
  const examId = String(params.examId);
  const studentId = String(params.studentId);
  const result = useStudentResult(examId, studentId);
  const report = result.data;

  return (
    <div className='space-y-4'>
      <Card title='Student Information'>
        <p><strong>Name:</strong> {report?.student?.firstName} {report?.student?.lastName}</p>
        <p><strong>Adm No:</strong> {report?.student?.enrollmentNo}</p>
        <p><strong>Class:</strong> {report?.student?.class?.name} {report?.student?.class?.section}</p>
      </Card>

      <Card title='Subjects'>
        <Table
          loading={result.isLoading}
          data={report?.entries ?? []}
          columns={[
            { key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' },
            { key: 'max', label: 'Max Marks', render: (row) => String(row.maxMarks ?? '-') },
            { key: 'marks', label: 'Marks', render: (row) => String(row.marks ?? '-') },
            { key: 'percent', label: 'Percentage', render: (row) => formatPercent(Number(row.percentage ?? 0)) },
            { key: 'status', label: 'Status', render: (row) => <Badge status={String(row.status ?? 'INCOMPLETE')} /> },
          ]}
        />
      </Card>

      <Card title='Summary'>
        <p>Total: {report?.total}/{report?.maxTotal}</p>
        <p>Percentage: {formatPercent(Number(report?.percentage ?? 0))}</p>
        <p>Grade: {report?.grade ?? '-'}</p>
        <p>Remarks: {report?.remarks ?? '-'}</p>
        <div className='mt-2'><Badge status={report?.status ?? 'INCOMPLETE'} label={`Result: ${report?.status ?? 'INCOMPLETE'}`} /></div>
      </Card>

      <Button onClick={async () => {
        const response = await api.get(`/reports/report-card/${examId}/${studentId}`, { responseType: 'blob' });
        downloadBlob(response.data, `report_card_${studentId}.pdf`);
      }}>Download Report Card PDF</Button>
    </div>
  );
}
