'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'

interface TeacherData {
  id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  designation?: string;
  qualification?: string;
  phone?: string;
  user?: {
    email?: string;
    name?: string;
  }
}

interface TeacherResponse {
  data: TeacherData;
}

interface AssignmentRow {
  id: string;
  subject?: { name?: string };
  classId?: string;
  class?: {
    name?: string;
    section?: string;
  };
}

interface AssignmentsResponse {
  data: AssignmentRow[];
}

interface ClassItem {
  id: string;
  name: string;
  section: string;
}

interface ClassesResponse {
  data: ClassItem[];
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

interface SubjectsResponse {
  data: SubjectItem[];
}

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const teacher = useQuery<TeacherResponse>({
    queryKey: ['teacher', id],
    queryFn: async () => (await api.get(`/teachers/${id}`)).data,
    enabled: !!id
  })

  const assignments = useQuery<AssignmentsResponse>({
    queryKey: ['teacher-subjects-by-teacher', id],
    queryFn: async () => (await api.get(`/teacher-subjects/teacher/${id}`)).data,
    enabled: !!id
  })

  const classes = useQuery<ClassesResponse>({
    queryKey: ['classes'],
    queryFn: async () => (await api.get('/classes')).data
  })

  const subjects = useQuery<SubjectsResponse>({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data
  })

  const teacherData = teacher.data?.data

  const columns: Column<AssignmentRow>[] = [
    { 
      key: 'subject', 
      label: 'Subject', 
      render: (row) => row.subject?.name ?? 'General' 
    },
    { 
      key: 'class', 
      label: 'Assigned Class', 
      render: (row) => row.class ? `${row.class.name} - ${row.class.section}` : (row.classId ?? 'TBD') 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Basic Information" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Employee ID</span>
              <span className="font-semibold">{teacherData?.employeeId ?? 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">First Name</span>
              <span className="font-semibold">{teacherData?.firstName ?? '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Last Name</span>
              <span className="font-semibold">{teacherData?.lastName ?? '-'}</span>
            </div>
          </div>
        </Card>

        <Card title="Contact & Professional" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Designation</span>
              <span className="font-semibold">{teacherData?.designation ?? 'Teacher'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Email</span>
              <span className="font-semibold">{teacherData?.user?.email ?? 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="font-semibold">{teacherData?.phone ?? 'N/A'}</span>
            </div>
          </div>
        </Card>

        <Card title="Academic Profile" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Qualification</span>
              <span className="font-semibold">{teacherData?.qualification ?? 'Graduate'}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Subject Assignments">
        <Table
          columns={columns}
          data={assignments.data?.data ?? []}
          loading={assignments.isLoading}
          keyExtractor={(row) => row.id}
        />
      </Card>

      <Card title="Assign Teacher">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="flex-1 flex flex-col space-y-1">
            <label className="text-sm font-medium text-slate-700">Class</label>
            <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full">
              <option value="">Select a class...</option>
              {(classes.data?.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.section}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 flex flex-col space-y-1">
            <label className="text-sm font-medium text-slate-700">Subject</label>
            <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full">
              <option value="">Select a subject...</option>
              {(subjects.data?.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm">
              Assign
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
