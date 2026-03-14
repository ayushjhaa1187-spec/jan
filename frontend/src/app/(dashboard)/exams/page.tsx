'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useExams } from '@/hooks/useExams'
import { Badge } from '@/components/ui/Badge'
import { Table, Column } from '@/components/ui/Table'

interface ExamRow { 
  id: string; 
  name: string; 
  status: string; 
  startDate: string; 
  endDate: string; 
  class?: { 
    id: string; 
    name: string; 
    section: string 
  } 
}

const statuses = ['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const;

export default function ExamsPage() {
  const { data } = useExams(); 
  const rows = (data?.data as any) ?? []
  
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Exams</h1>
        <Link href='/exams/new' className='bg-[#2b6cb0] text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors'>
          Create Exam
        </Link>
      </div>
      
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <table className='w-full text-left'>
          <thead className='bg-gray-50 border-b'>
            <tr>
              <th className='px-4 py-3 font-semibold text-gray-700'>Name</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>Class</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>Start Date</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>End Date</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>Status</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {rows.map((e: any) => (
              <tr key={e.id} className='hover:bg-gray-50 transition-colors'>
                <td className='px-4 py-3 font-medium'>{e.name}</td>
                <td className='px-4 py-3 text-gray-600'>{e.class?.name} {e.class?.section ? `(${e.class.section})` : ''}</td>
                <td className='px-4 py-3 text-gray-600'>{new Date(e.startDate).toLocaleDateString()}</td>
                <td className='px-4 py-3 text-gray-600'>{new Date(e.endDate).toLocaleDateString()}</td>
                <td className='px-4 py-3'>
                  <Badge status={e.status} />
                </td>
                <td className='px-4 py-3'>
                  <Link href={`/exams/${e.id}`} className='text-blue-600 hover:text-blue-800 font-medium'>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className='px-4 py-8 text-center text-gray-500'>
                  No exams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
