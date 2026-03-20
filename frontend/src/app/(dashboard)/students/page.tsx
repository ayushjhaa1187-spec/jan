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
      className="space-y-12"
    >
      <motion.div variants={item} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="text-6xl font-black text-slate-950 tracking-tighter mb-4 leading-none uppercase">Academic <br /> <span className="text-indigo-600">Infrastructure.</span></h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Live Directory & Cluster Governance v1.02</p>
        </div>
        <Link href="/students/new">
          <Button 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            className="py-10 px-12 bg-slate-950 hover:bg-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl shadow-slate-200 flex items-center gap-4 transition-all"
          >
            <UserPlus size={22} className="text-indigo-400" />
            Initialize Student Record
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
      
      <motion.div variants={item} className="flex flex-col xl:flex-row gap-6">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
            <Search className="text-slate-400" size={20} />
          </div>
          <Input 
            placeholder="OMNI-SEARCH CLUSTER: NAME, ADMISSION_ID, OR GRADE_LEVEL..." 
            className="pl-16 h-20 rounded-[2.2rem] border-slate-200 bg-white/50 backdrop-blur-xl focus:bg-white focus:border-indigo-500 transition-all font-black text-[10px] uppercase tracking-widest placeholder:text-slate-300"
          />
        </div>
        <div className="flex gap-4">
          <Button 
            variant="secondary" 
            className="h-20 rounded-[2rem] border-slate-200 font-black px-10 flex gap-3 text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50 transition-all"
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
              toast.success('Governance Data Exported');
            }}
          >
             <Download size={18} className="text-indigo-600" /> Export CSV
          </Button>
          <Button variant="secondary" className="h-20 rounded-[2rem] border-slate-200 font-black px-10 flex gap-3 text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50 transition-all">
             <Filter size={18} className="text-indigo-600" /> Filter Cluster
          </Button>
        </div>
      </motion.div>
      
      <motion.div variants={item} className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30" />
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

