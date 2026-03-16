'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Search, GraduationCap, Filter, Download } from 'lucide-react'
import { toast } from 'sonner'
import { useStudents, useUpdateStudent } from '@/hooks/useStudents'
import { Table, Column } from '@/components/ui/Table'
import { EditableCell } from '@/components/ui/EditableCell'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, isPending } = useStudents({ page });
  const updateStudent = useUpdateStudent();
  
  const rows = (data as any)?.data ?? [];
  const meta = (data as any)?.meta ?? { totalPages: 1, total: 0 };

  const columns = useMemo<Column<StudentRow>[]>(
    () => [
      { 
        key: 'enrollmentNo', 
        label: 'Adm No',
        render: (student) => (
          <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs">
            {(student as any).enrollmentNo ?? (student as any).adm_no ?? '-'}
          </span>
        )
      },
      {
        key: 'name',
        label: 'Name',
        render: (student) => {
          const first = (student as any).firstName || (student as any).name || '';
          const last = (student as any).lastName || '';
          const initials = first.charAt(0) + (last?.charAt(0) || '');
          
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
                {initials || 'S'}
              </div>
              <EditableCell 
                value={first}
                className="text-sm font-bold text-slate-900"
                onSave={async (newName) => {
                   await updateStudent.mutateAsync({ 
                     id: student.id, 
                     payload: { name: newName } 
                   })
                }}
              />
            </div>
          );
        }
      },
      {
        key: 'className',
        label: 'Class',
        render: (student) => (
          <div className="flex flex-col">
             <span className="font-bold text-slate-700">{student.class?.name ?? '-'}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.class?.section || 'No Section'}</span>
          </div>
        )
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (student) => (
          <Link href={`/students/${student.id}`} className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all">
            Profile <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )
      }
    ],
    [updateStudent]
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Academic Directory</h1>
           <p className="text-slate-500 font-medium">Manage and audit the complete student lifecycle across all classes.</p>
        </div>
        <Link href="/students/new">
          <Button className="py-6 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <UserPlus size={20} />
            Register New Student
          </Button>
        </Link>
      </motion.div>

      {/* Expanded Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
         <StatCard title="Total Enrolled" value={meta.total || 0} icon={<Users size={20} />} />
         <StatCard title="Active Session" value="2024-25" icon={<GraduationCap size={20} />} />
         <StatCard title="Compliance Rate" value="98.5%" icon={<CheckCircle2 size={20} />} />
         <div className="hidden lg:block">
            <StatCard title="Pending Docs" value="12" icon={<Clock size={20} />} />
         </div>
      </div>
      
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name, admission ID, or grade..." 
            className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-indigo-500 shadow-sm transition-all"
          />
        </div>
        <Button 
          variant="secondary" 
          className="h-14 rounded-2xl border-slate-200 font-bold px-6 flex gap-2"
          onClick={() => {
            if (!rows.length) return;
            const headers = ['Admission No', 'First Name', 'Last Name', 'Class'];
            const csvContent = [
              headers.join(','),
              ...rows.map((s: any) => [
                s.enrollmentNo || s.adm_no || '-',
                s.firstName || s.name || '-',
                s.lastName || '-',
                `${s.class?.name || '-' } ${s.class?.section || '-'}`
              ].join(','))
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_export_${Date.now()}.csv`;
            a.click();
            toast.success('Data exported to CSV');
          }}
        >
           <Download size={18} /> Export CSV
        </Button>
        <Button variant="secondary" className="h-14 rounded-2xl border-slate-200 font-bold px-6 flex gap-2">
           <Filter size={18} /> Filter List
        </Button>
      </motion.div>
      
      <motion.div variants={item} className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <Table 
          columns={columns} 
          data={rows} 
          loading={isPending} 
          keyExtractor={(student) => student.id} 
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
        />
      </motion.div>

      <motion.div variants={item} className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <p className="text-sm text-slate-400 font-bold">Showing {rows.length} of {meta.total} records</p>
        <Pagination 
          page={page} 
          totalPages={meta.totalPages} 
          onPageChange={setPage} 
        />
      </motion.div>
    </motion.div>
  );
}

import { ArrowRight, CheckCircle2, Clock } from 'lucide-react'

