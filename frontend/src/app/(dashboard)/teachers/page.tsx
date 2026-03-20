'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { Table, Column } from '@/components/ui/Table'

interface TeacherRow {
  id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  subjects?: Array<{ id: string }>;
}

interface TeachersResponse {
  data: {
    data: TeacherRow[];
    meta?: {
      page?: number;
      totalPages?: number;
    };
  };
}

export default function TeachersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const teachers = useQuery<TeachersResponse>({
    queryKey: ['teachers', page, search],
    queryFn: async () => (await api.get('/teachers', { params: { page, limit: 10, search } })).data,
  })

  const columns = useMemo<Column<TeacherRow>[]>(
    () => [
      { 
        key: 'employeeId', 
        label: 'Employee ID',
        render: (row) => (
          <span className="font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-[10px] uppercase">
            {row.employeeId || 'EMP-X'}
          </span>
        )
      },
      {
        key: 'name',
        label: 'Administrator Name',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
              {(row.firstName?.charAt(0) || 'T')}
            </div>
            <span className="font-black text-slate-950 uppercase tracking-tight text-xs">
              {`${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || 'No Name'}
            </span>
          </div>
        )
      },
      {
        key: 'subjects',
        label: 'Managed Subjects',
        render: (row) => (
          <span className="font-bold text-slate-700">{row.subjects?.length ?? 0} Active Modules</span>
        )
      },
      {
        key: 'actions',
        label: 'Governance',
        render: (row) => (
          <Link className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-black text-[10px] uppercase tracking-widest transition-all" href={`/teachers/${row.id}`}>
            Audit Profile <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="text-6xl font-black text-slate-950 tracking-tighter mb-4 leading-none uppercase text-balance">Personnel <br /> <span className="text-indigo-600">Infrastructure.</span></h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Operational Staff & Faculty Directory</p>
        </div>
      </div>

      <Card className="rounded-[3.5rem] border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30" />
        <div className="mb-10 flex flex-col sm:flex-row gap-6">
          <div className="relative flex-1">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <Input
                placeholder="OMNI-SEARCH CLUSTER: SEARCH BY NAME OR EMPLOYEE_ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-14 h-16 rounded-[1.8rem] transition-all"
             />
          </div>
        </div>
        
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <Table
            columns={columns}
            data={teachers.data?.data.data ?? []}
            loading={teachers.isLoading}
            keyExtractor={(row) => row.id}
          />
        </div>
        
        <div className="mt-10 flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
          <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Global Personnel Node #4</p>
          <Pagination
            page={page}
            totalPages={teachers.data?.data.meta?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  )
}

import { Search, ArrowRight } from 'lucide-react'

