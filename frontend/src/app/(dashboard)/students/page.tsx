'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useStudents } from '@/hooks/useStudents'
import { Table, Column } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'

interface StudentRow {
  id: string
  enrollmentNo?: string
  firstName?: string
  lastName?: string
  class?: {
    name?: string
    section?: string
  }
}

export default function StudentsPage() {
  const { data, isPending } = useStudents({ page: 1 })
  const rows: StudentRow[] = data?.data?.data ?? []

  const columns = useMemo<Column<StudentRow>[]>(
    () => [
      { key: 'enrollmentNo', label: 'Adm No' },
      {
        key: 'name',
        label: 'Name',
        render: (student) => `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()
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
        render: (student) => <Link href={`/students/${student.id}`}>View</Link>
      }
    ],
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/students/new" className="bg-[#2b6cb0] text-white px-3 py-2 rounded">
          Add
        </Link>
      </div>
      <div>
        <Input placeholder="Search students" />
      </div>
      <Table columns={columns} data={rows} loading={isPending} keyExtractor={(student) => student.id} />
    </div>
  )
}
