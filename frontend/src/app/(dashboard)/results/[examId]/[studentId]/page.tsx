'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useStudentResult } from '@/hooks/useResults';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';

interface StudentResultView {
  student: { name: string; adm_no: string; class: string; section: string };
  exam: { name: string; startDate?: string; endDate?: string };
  subjects: Array<{ subject: string; maxMarks: number; marks: number; percentage: number; status: 'PASS' | 'FAIL' }>;
  total: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  remarks: string;
  result: 'PASS' | 'FAIL';
}

export default function StudentReportCardPage() {
  const params = useParams<{ examId: string; studentId: string }>();
  const examId = params.examId;
  const studentId = params.studentId;
  const resultQuery = useStudentResult(examId, studentId);

  const data = resultQuery.data as StudentResultView | undefined;

  const downloadPdf = async () => {
    try {
      const response = await api.get(`/reports/report-card/${examId}/${studentId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_card_${examId}_${studentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className='space-y-4'>
      <Card title='Student Report Card'>
        <p><strong>Name:</strong> {data?.student.name}</p>
        <p><strong>Adm No:</strong> {data?.student.adm_no}</p>
        <p><strong>Class:</strong> {data?.student.class} {data?.student.section}</p>
        <p><strong>Exam:</strong> {data?.exam.name}</p>
      </Card>

      <Card title='Subjects'>
        <Table
          columns={[
            { key: 'subject', label: 'Subject' },
            { key: 'maxMarks', label: 'Max Marks' },
            { key: 'marks', label: 'Marks' },
            { key: 'percentage', label: '%' },
            { key: 'status', label: 'Status', render: (row: StudentResultView['subjects'][number]) => <Badge status={row.status} /> },
          ]}
          data={data?.subjects || []}
        />
      </Card>

      <Card title='Summary'>
        <p>Total: {data?.total}/{data?.maxTotal}</p>
        <p>Percentage: {data?.percentage}%</p>
        <p>Grade: {data?.grade}</p>
        <p>Remarks: {data?.remarks}</p>
        <p>Result: <Badge status={data?.result || 'FAIL'} /></p>
      </Card>

      <Button onClick={() => void downloadPdf()}>Download Report Card PDF</Button>
    </div>
  );
}
