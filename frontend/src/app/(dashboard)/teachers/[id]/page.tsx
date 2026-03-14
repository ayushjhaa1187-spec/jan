'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'

interface TeacherData { id: string; employeeId: string; firstName?: string; lastName?: string; designation?: string; qualification?: string; phone?: string }
interface Assignment { id: string; subject?: { name: string }; class?: { name: string; section: string } }

export default function TeacherDetailPage() {
  const id = useParams<{ id: string }>().id
  const teacher = useQuery<{ data: TeacherData }>({ queryKey: ['teacher', id], queryFn: async () => (await api.get(`/teachers/${id}`)).data })
  const assignments = useQuery<{ data: Assignment[] }>({ queryKey: ['teacher-subjects', id], queryFn: async () => (await api.get(`/teacher-subjects/teacher/${id}`)).data })
  const cols: Column<Assignment>[] = [{ key: 'subject', label: 'Subject', render: (r) => r.subject?.name ?? '-' }, { key: 'class', label: 'Class', render: (r) => `${r.class?.name ?? '-'} ${r.class?.section ?? ''}` }]
  return <div className="space-y-4"><Card title="Teacher Profile"><p><strong>Name:</strong> {`${teacher.data?.data.firstName ?? ''} ${teacher.data?.data.lastName ?? ''}`}</p><p><strong>Employee ID:</strong> {teacher.data?.data.employeeId}</p><p><strong>Designation:</strong> {teacher.data?.data.designation ?? '-'}</p><p><strong>Qualification:</strong> {teacher.data?.data.qualification ?? '-'}</p><p><strong>Phone:</strong> {teacher.data?.data.phone ?? '-'}</p></Card><Card title="Subject Assignments"><Table columns={cols} data={assignments.data?.data ?? []} keyExtractor={(r) => r.id} loading={assignments.isLoading} /></Card></div>
}
