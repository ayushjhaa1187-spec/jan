'use client'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import GradeDistributionChart from '@/components/charts/GradeDistributionChart'
import PassFailChart from '@/components/charts/PassFailChart'

export default function DashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  return <div className='space-y-4'>
    <h1 className='text-2xl font-bold'>Dashboard</h1>
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      {(role === 'Principal' ? ['Total Students','Total Exams','Results Published','Pending Approval'] : role === 'ExamDept' ? ['Active Exams','Pending Review','Results Ready'] : role === 'Teacher' ? ['My Classes','Pending Marks'] : ['Total Students','Total Classes','Total Teachers']).map((k)=><Card key={k}>{k}</Card>)}
    </div>
    <div className='grid md:grid-cols-2 gap-4'><GradeDistributionChart /><PassFailChart /></div>
  </div>
}
