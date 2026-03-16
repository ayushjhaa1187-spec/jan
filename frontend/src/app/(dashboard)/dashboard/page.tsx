'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Settings, 
  ArrowRight, 
  Calendar, 
  Shield, 
  BarChart3, 
  GraduationCap,
  Bell,
  Search,
  Zap
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { CountUp } from '@/components/ui/CountUp'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function PremiumStatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div variants={item}>
      <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 border-none bg-white p-6 shadow-xl shadow-slate-200/50 rounded-[2rem]">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 -translate-y-8 translate-x-8 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-slate-900">
              {typeof value === 'number' ? <CountUp target={value} /> : value}
            </h3>
          </div>
          <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
           <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
           <span>from last session</span>
        </div>
      </Card>
    </motion.div>
  )
}

function QuickAction({ label, icon: Icon, href, color }: { label: string; icon: any; href: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
      >
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
          <Icon size={20} />
        </div>
        <span className="font-bold text-slate-700 text-sm">{label}</span>
        <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
      </motion.div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const students = useQuery({ queryKey: ['dash-students'], queryFn: async () => (await api.get('/students', { params: { page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const exams = useQuery({ queryKey: ['dash-exams'], queryFn: async () => (await api.get('/exams', { params: { page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const published = useQuery({ queryKey: ['dash-exams-published'], queryFn: async () => (await api.get('/exams', { params: { status: 'PUBLISHED', page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const review = useQuery({ queryKey: ['dash-exams-review'], queryFn: async () => (await api.get('/exams', { params: { status: 'REVIEW', page: 1, limit: 1 } })).data, enabled: Boolean(user) })
  const audit = useQuery({ queryKey: ['dash-audit'], queryFn: async () => (await api.get('/audit', { params: { limit: 10 } })).data, enabled: user?.role === 'Principal' })
  const teachers = useQuery({ queryKey: ['dash-teachers'], queryFn: async () => (await api.get('/teachers', { params: { page: 1, limit: 1 } })).data, enabled: user?.role === 'OfficeStaff' || user?.role === 'Principal' })
  const classes = useQuery({ queryKey: ['dash-classes'], queryFn: async () => (await api.get('/classes', { params: { page: 1, limit: 1 } })).data, enabled: user?.role === 'OfficeStaff' || user?.role === 'Principal' })
  const teacherSubjects = useQuery({ queryKey: ['dash-teacher-subjects', user?.id], queryFn: async () => (await api.get('/teacher-subjects', { params: { userId: user?.id } })).data, enabled: user?.role === 'Teacher' && Boolean(user?.id) })

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {/* Header / Welcome */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, <span className="text-indigo-600">{user?.name}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Calendar size={16} className="text-indigo-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Explore modules..." className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm" />
           </div>
           <button className="p-3 bg-white border border-slate-200 rounded-xl relative hover:bg-slate-50 transition-colors shadow-sm">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
           </button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'Principal' ? (
          <>
            <PremiumStatCard title="Total Students" value={students.data?.meta?.total ?? 0} icon={Users} color="indigo" />
            <PremiumStatCard title="Active Exams" value={exams.data?.meta?.total ?? 0} icon={FileText} color="blue" />
            <PremiumStatCard title="Published" value={published.data?.meta?.total ?? 0} icon={CheckCircle2} color="emerald" />
            <PremiumStatCard title="In Review" value={review.data?.meta?.total ?? 0} icon={Clock} color="rose" />
          </>
        ) : user?.role === 'Teacher' ? (
          <>
            <PremiumStatCard title="Assign Subjects" value={teacherSubjects.data?.data?.length ?? 0} icon={GraduationCap} color="indigo" />
            <PremiumStatCard title="Pending Marks" value={review.data?.meta?.total ?? 0} icon={Clock} color="rose" />
            <PremiumStatCard title="Recent Exams" value={exams.data?.meta?.total ?? 0} icon={FileText} color="blue" />
            <PremiumStatCard title="Success Rate" value="94%" icon={CheckCircle2} color="emerald" />
          </>
        ) : (
          <>
            <PremiumStatCard title="Total Students" value={students.data?.meta?.total ?? 0} icon={Users} color="indigo" />
            <PremiumStatCard title="Classes" value={classes.data?.meta?.total ?? 0} icon={Shield} color="blue" />
            <PremiumStatCard title="Total Staff" value={teachers.data?.meta?.total ?? 0} icon={GraduationCap} color="emerald" />
            <PremiumStatCard title="System Health" value="100%" icon={Zap} color="rose" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          {user?.role === 'Principal' ? (
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xl font-black text-slate-900">Governance Audit Trail</h4>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Live Institutional Activity</p>
                </div>
                <Link href="/audit"><Button variant="secondary" className="rounded-xl font-bold">View Full Log</Button></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Time</th>
                      <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Administrator</th>
                      <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Action Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(audit.data?.data ?? []).map((r: any) => (
                      <tr key={r.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-sm font-bold text-slate-500">{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">{r.user?.name?.charAt(0)}</div>
                              <span className="text-sm font-bold text-slate-900">{r.user?.name}</span>
                           </div>
                        </td>
                        <td className="py-4">
                           <div className="flex items-center gap-2">
                              <Badge status={r.action === 'LOGIN' ? 'PUBLISHED' : 'REVIEW'} />
                              <span className="text-sm font-semibold text-slate-700">{r.action} {r.entity}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Academic Progress</h4>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Recent Student Enrollments</p>
                  </div>
                  <Link href="/students"><Button variant="secondary" className="rounded-xl font-bold">Directory</Button></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {(students.data?.data ?? []).slice(0, 6).map((s: any) => (
                      <div key={s.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                         <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            {s.adm_no?.slice(-2) || 'S'}
                         </div>
                         <div>
                            <div className="font-bold text-slate-900 truncate max-w-[120px]">{s.name}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{s.adm_no}</div>
                         </div>
                      </div>
                   ))}
                </div>
            </Card>
          )}
        </motion.div>

        {/* Sidebar Actions */}
        <motion.div variants={item} className="space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 p-8 bg-indigo-600 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Zap size={80} />
              </div>
              <h4 className="text-xl font-black mb-2 relative z-10">Commander Quick Tasks</h4>
              <p className="text-indigo-100 text-sm font-medium mb-8 relative z-10">Operational shortcuts for your current role.</p>
              
              <div className="space-y-4 relative z-10">
                {user?.role === 'Principal' && (
                  <>
                    <QuickAction label="Manage Institutional Users" icon={Users} href="/users" color="indigo" />
                    <QuickAction label="Academic Audit Logs" icon={Shield} href="/audit" color="indigo" />
                    <QuickAction label="Generate Reports" icon={BarChart3} href="/reports" color="indigo" />
                  </>
                )}
                {user?.role === 'Teacher' && (
                  <>
                    <QuickAction label="Enter Subject Marks" icon={FileText} href="/exams" color="indigo" />
                    <QuickAction label="View Class Results" icon={CheckCircle2} href="/results" color="indigo" />
                    <QuickAction label="Upcoming Schedules" icon={Calendar} href="/exams" color="indigo" />
                  </>
                )}
                {(user?.role === 'OfficeStaff' || user?.role === 'Principal') && (
                  <>
                    <QuickAction label="Register New Student" icon={Plus} href="/students/new" color="indigo" />
                    <QuickAction label="Class Management" icon={GraduationCap} href="/classes" color="indigo" />
                    <QuickAction label="Subject Catalog" icon={FileText} href="/subjects" color="indigo" />
                  </>
                )}
                <QuickAction label="Account Settings" icon={Settings} href="/dashboard" color="indigo" />
              </div>
           </Card>

           <div className="p-8 rounded-[2.5rem] bg-indigo-50 border border-indigo-100">
              <h5 className="font-black text-slate-900 mb-2">Academic OS Tip</h5>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Use the <span className="text-indigo-600 font-bold">Marks Entry</span> module to lock marks after submission to prevent accidental edits.</p>
           </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

