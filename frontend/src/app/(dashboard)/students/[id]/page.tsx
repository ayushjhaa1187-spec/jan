'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useTransferClass } from '@/hooks/useStudents'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

interface StudentRow {
  id: string
  firstName: string
  lastName: string
  enrollmentNo: string
  class?: { name: string; section: string }
}

interface ResultRow {
  id: string
  exam?: { name: string }
  total?: number
  max?: number
  percentage?: number
  grade?: string
  status: string
  remarks?: string
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>()
  const studentId = params.id
  const [nextClassId, setNextClassId] = useState('')
  const [openConfirm, setOpenConfirm] = useState(false)

  const student = useQuery({ queryKey: ['student', studentId], queryFn: async () => (await api.get(`/students/${studentId}`)).data })
  const results = useQuery({ queryKey: ['student-results', studentId], queryFn: async () => (await api.get(`/students/${studentId}/results`)).data })
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const transfer = useTransferClass(studentId)

  const studentData = (student.data as { data?: StudentRow })?.data

  const handleTransfer = async () => {
    if (!nextClassId) return
    try {
      await transfer.mutateAsync(nextClassId)
      toast.success('Class transferred successfully')
      setOpenConfirm(false)
      setNextClassId('')
    } catch {
      toast.error('Transfer failed')
    }
  }

  return (
    <div className='space-y-4'>
      <Card title='Student Info'>
        <div className='grid gap-3 md:grid-cols-2'>
          <p><strong>Name:</strong> {studentData ? `${studentData.firstName} ${studentData.lastName}` : '-'}</p>
          <p><strong>Adm No:</strong> {studentData?.enrollmentNo}</p>
          <p><strong>Class:</strong> {studentData?.class?.name}</p>
          <p><strong>Section:</strong> {studentData?.class?.section}</p>
        </div>
      </Card>

      <Card title='Results History'>
        <Table
          columns={[
            { key: 'exam', label: 'Exam', render: (row) => (row as ResultRow).exam?.name || '-' },
            { key: 'total', label: 'Total', render: (row) => String((row as ResultRow).total ?? '-') },
            { key: 'max', label: 'Max', render: (row) => String((row as ResultRow).max ?? '-') },
            { key: 'percentage', label: '%', render: (row) => (row as ResultRow).percentage !== undefined ? `${(row as ResultRow).percentage}%` : '-' },
            { key: 'grade', label: 'Grade', render: (row) => (row as ResultRow).grade || '-' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={(row as ResultRow).status} /> },
          ]}
          data={((results.data as { data?: ResultRow[] })?.data) ?? []}
          loading={results.isLoading}
          keyExtractor={(row) => (row as ResultRow).id}
        />
      </Card>

      <Card title='Transfer Class'>
        <div className='flex gap-3'>
          <select className='rounded border px-3 py-2' value={nextClassId} onChange={(event) => setNextClassId(event.target.value)}>
            <option value=''>Select class</option>
            {(((classes.data as { data?: Array<{ id: string; name: string; section: string }> })?.data) ?? []).map((classItem) => (
              <option key={classItem.id} value={classItem.id}>{classItem.name} - {classItem.section}</option>
            ))}
          </select>
          <Button onClick={() => setOpenConfirm(true)} disabled={!nextClassId}>Transfer</Button>
        </div>
      </Card>

      <Modal isOpen={openConfirm} onClose={() => setOpenConfirm(false)} title='Confirm Transfer' footer={<><Button variant='secondary' onClick={() => setOpenConfirm(false)}>Cancel</Button><Button onClick={handleTransfer} loading={transfer.isPending}>Confirm</Button></>}>
        <p>Are you sure you want to transfer this student to the selected class?</p>
      </Modal>
    </div>
  )
}
