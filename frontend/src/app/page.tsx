import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Building, User, Users, LineChart, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">EduTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Register School
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 pb-24">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl">
          Smart Examination <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Management System
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Manage exams, marks and report cards effortlessly. Designed specifically for modern schools, institutions, and independent teachers.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-2xl mx-auto">
          <Link 
            href="/register" 
            className="group relative flex flex-1 items-center justify-center gap-3 bg-white border-2 border-indigo-600 p-6 rounded-2xl hover:bg-indigo-50 hover:-translate-y-1 transition-all duration-200 shadow-sm"
          >
            <div className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition">
              <Building className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-lg">Join As School</div>
              <div className="text-sm text-slate-500 font-medium">For institutions & admins</div>
            </div>
            <ArrowRight className="h-5 w-5 text-indigo-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link 
            href="/login?mode=independent" 
            className="group relative flex flex-1 items-center justify-center gap-3 bg-white border-2 border-slate-200 p-6 rounded-2xl hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all duration-200 shadow-sm"
          >
            <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-slate-200 transition">
              <User className="h-8 w-8 text-slate-600" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-lg">Independent</div>
              <div className="text-sm text-slate-500 font-medium">For private educators</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Features Preview */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto w-full text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Exam Creation</h3>
            <p className="text-slate-500 text-sm mt-2">Draft, review, and approve exams in a structured workflow.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Marks Entry</h3>
            <p className="text-slate-500 text-sm mt-2">Secure portal for assigned teachers to enter and lock marks.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-purple-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <LineChart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Result Publishing</h3>
            <p className="text-slate-500 text-sm mt-2">Generate accurate statistics, class rankings, and grades.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="bg-rose-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <ShieldCheck className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Report Cards</h3>
            <p className="text-slate-500 text-sm mt-2">Automated PDF report cards with institutional branding.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} EduTrack. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-slate-900">Contact</Link>
            <Link href="#" className="hover:text-slate-900">Documentation</Link>
            <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
