'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useStudents } from '@/hooks/useStudents'
import { Table, Column } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'

interface StudentRow {
  id: string;
  enrollmentNo?: string;
  firstName?: string;
  lastName?: string;
  class?: {
    name?: string;
    section?: string;
  };
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const { data, isPending } = useStudents({ page });
  
  // Safely extract rows and meta from the API response structure
  const rows = (data as any)?.data ?? [];
  const meta = (data as any)?.meta ?? { totalPages: 1 };

  const columns = useMemo<Column<StudentRow>[]>(
    () => [
      { 
        key: 'enrollmentNo', 
        label: 'Adm No',
        render: (student) => (student as any).enrollmentNo ?? (student as any).adm_no ?? '-'
      },
      {
        key: 'name',
        label: 'Name',
        render: (student) => {
          const first = (student as any).firstName || (student as any).name || '';
          const last = (student as any).lastName || '';
          return `${first} ${last}`.trim() || 'Unnamed';
        }
      },
      {
        key: 'className',
        label: 'Class',
        render: (student) => student.class?.name ?? '-'
      },
      {
        key: 'section',
        label: 'Section',
        render: (student) => student.class?.section ?? '-'
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (student) => (
          <Link href={`/students/${student.id}`} className="text-blue-600 hover:underline font-medium">
            View Details
          </Link>
        )
      }
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Link href="/students/new" className="bg-[#2b6cb0] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
          Register Student
        </Link>
      </div>
      
      <div className="max-w-sm">
        <Input placeholder="Search by name or admission number..." />
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Table 
          columns={columns} 
          data={rows} 
          loading={isPending} 
          keyExtractor={(student) => student.id} 
        />
      </div>

      <div className="flex justify-end mt-4">
        <Pagination 
          page={page} 
          totalPages={meta.totalPages} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
