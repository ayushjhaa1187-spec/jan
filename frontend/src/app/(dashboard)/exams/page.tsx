'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useExams } from '@/hooks/useExams'
import { Badge } from '@/components/ui/Badge'
import { Table, Column } from '@/components/ui/Table'

interface ExamRow { id: string; name: string; status: string; classId: string; class?: { name: string; section: string }; startDate: string; endDate: string }
interface ClassRow { id: string; name: string; section: string }
const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const

interface ExamRow { id: string; name: string; status: string; startDate: string; endDate: string; class?: { id: string; name: string; section: string } }
interface ExamResponse { data: { data: ExamRow[] } }
interface ClassesResponse { data: Array<{ id: string; name: string; section: string }> }

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const

export default function ExamsPage() {
  const { data } = useExams(); const rows = data?.data ?? []
  return <div className='space-y-4'><div className='flex justify-between'><h1 className='text-2xl font-bold'>Exams</h1><Link href='/exams/new' className='bg-[#2b6cb0] text-white px-3 py-2 rounded'>Create</Link></div>
    <div className='bg-white rounded shadow'><table className='w-full'><thead><tr><th>Name</th><th>Class</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((e:{id:string;name:string;class?:{name:string};startDate:string;endDate:string;status:string})=><tr key={e.id}><td>{e.name}</td><td>{e.class?.name}</td><td>{new Date(e.startDate).toLocaleDateString()}</td><td>{new Date(e.endDate).toLocaleDateString()}</td><td><Badge status={e.status} /></td><td><Link href={`/exams/${e.id}`}>Open</Link></td></tr>)}</tbody></table></div></div>
}
