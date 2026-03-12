'use client'
import Link from 'next/link'
import { useStudents } from '@/hooks/useStudents'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'

export default function StudentsPage() {
  const { data } = useStudents(1)
  const rows = data?.data?.data ?? []
  return <div className='space-y-4'><div className='flex justify-between'><h1 className='text-2xl font-bold'>Students</h1><Link href='/students/new' className='bg-[#2b6cb0] text-white px-3 py-2 rounded'>Add</Link></div>
    <div><Input placeholder='Search students' /></div>
    <Table><thead><tr><th>Adm No</th><th>Name</th><th>Class</th><th>Section</th><th>Actions</th></tr></thead><tbody>{rows.map((s:{id:string;enrollmentNo:string;firstName:string;lastName:string;class:{name:string;section:string}})=><tr key={s.id}><td>{s.enrollmentNo}</td><td>{s.firstName} {s.lastName}</td><td>{s.class?.name}</td><td>{s.class?.section}</td><td><Link href={`/students/${s.id}`}>View</Link></td></tr>)}</tbody></Table>
  </div>
}

