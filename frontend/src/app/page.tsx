'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Building, 
  User, 
  Users, 
  LineChart, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  Zap, 
  BarChart, 
  Clock, 
  Globe,
  Database,
  Cpu,
  Lock,
  Layers,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

function MarqueeItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
      {children}
      {children}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any; title: string; desc: string; color: string }) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group p-12 rounded-[3rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-40 h-40 bg-${color}-500/5 rounded-full -translate-y-10 translate-x-10 blur-[80px] group-hover:scale-150 transition-transform duration-700`} />
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-${color}-50 text-${color}-600 group-hover:bg-${color}-600 group-hover:text-white transition-all duration-500 relative z-10 shadow-sm`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-950 mb-4 relative z-10 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed font-bold uppercase text-[10px] tracking-widest relative z-10 opacity-70">{desc}</p>
    </motion.div>
  )
}

export default function LandingPage() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white overflow-x-hidden pt-20">
      
      {/* Dynamic Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/60 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-slate-950 p-2.5 rounded-2xl shadow-2xl shadow-slate-200 hover:rotate-6 transition-transform">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-950 tracking-tighter">EduTrack<span className="text-indigo-600">.</span></span>
          </motion.div>
          
          <div className="hidden lg:flex items-center gap-12">
             {['Features', 'Governance', 'Security', 'Enterprise'].map((item) => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black text-slate-400 hover:text-slate-950 transition-colors uppercase tracking-[0.2em]">{item}</Link>
             ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <Link href="/login" className="text-[10px] font-black text-slate-400 hover:text-slate-950 transition-colors uppercase tracking-[0.2em] hidden sm:block">
              Admin Gateway
            </Link>
            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center px-8 py-3.5 font-black text-[10px] uppercase tracking-[0.2em] text-white bg-slate-950 rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-100 transition-all active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">Initialize Deployment <ChevronRight size={14} /></span>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section v2 */}
      <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56">
        <div className="absolute top-0 inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,#eff6ff_0%,#ffffff_100%)] opacity-70" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-100 mb-16"
          >
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm" />)}
            </div>
            <span className="text-xs font-black text-slate-950 tracking-[0.1em] uppercase">Authored by <span className="text-indigo-600">1,200+</span> Global Boards</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
            className="text-7xl lg:text-[11rem] font-black text-slate-950 tracking-[calc(-0.04em)] leading-[0.8] mb-16"
          >
            Academic <br />
            <span className="text-indigo-600">Operating System.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl lg:text-3xl text-slate-400 font-bold max-w-5xl mx-auto leading-relaxed mb-20 uppercase tracking-tight"
          >
            Industrial governance for institutions that demand <br /> 
            absolute precision and zero-latency performance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:shadow-indigo-200/50 transition-all hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-4"
            >
              Deploy Infrastructure <ArrowRight size={20} />
            </Link>
            <Link 
              href="/login?mode=independent" 
              className="w-full sm:w-auto px-16 py-8 bg-white/70 backdrop-blur-xl border border-slate-200 text-slate-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-white hover:border-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-100"
            >
              Independent Mode
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative bg-slate-900 rounded-[4rem] p-8 lg:p-20 overflow-hidden shadow-2xl shadow-indigo-100"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 -skew-x-12 translate-x-20" />
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tighter">Command information <br /> at scale.</h2>
                <div className="space-y-6">
                  {[
                    { icon: Zap, title: "Zero Lag Interface", desc: "Built with React Server Components for instantaneous interaction." },
                    { icon: ShieldCheck, title: "Audit Trail", desc: "Every mark edit is logged with timestamp, IP, and user identity." },
                    { icon: BarChart, title: "Visual Logic", desc: "Automatic bell curve generation and subject performance drift alerts." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors">
                      <div className="bg-indigo-600/20 p-3 rounded-xl h-fit">
                        <item.icon className="text-indigo-400 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold mb-1">{item.title}</h4>
                        <p className="text-slate-400 text-sm font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                {/* Simulated Dashboard UI */}
                <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/50" />
                       <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                       <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="h-6 w-32 bg-white/5 rounded-full" />
                  </div>
                  <div className="space-y-4">
                     <div className="h-12 w-full bg-white/5 rounded-2xl animate-pulse" />
                     <div className="h-40 w-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl" />
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-2xl" />
                        <div className="h-24 bg-white/5 rounded-2xl" />
                     </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-10 -right-10 bg-indigo-600 p-6 rounded-3xl shadow-2xl"
                >
                  <Star className="text-white w-8 h-8" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Schools Marquee */}
      <div className="py-20 border-y border-slate-100 bg-white overflow-hidden relative group">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          <div className="flex gap-20 items-center animate-marquee whitespace-nowrap">
            {[
              "Precision Grading",
              "Audit-Ready Vaults",
              "Zero-Conflict Sync",
              "ISO 27001 Secure",
              "Multi-Tenant Isolation",
              "Real-time Analytics",
              "Enterprise Governance",
              "Automated Reporting",
              "Academic Intelligence",
              "Global Scale"
            ].map((tagline, i) => (
              <div key={i} className="flex items-center gap-4 opacity-100 transition-all cursor-pointer group-hover:[animation-play-state:paused] hover:scale-105">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{tagline}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              "Precision Grading",
              "Audit-Ready Vaults",
              "Zero-Conflict Sync",
              "ISO 27001 Secure",
              "Multi-Tenant Isolation",
              "Real-time Analytics",
              "Enterprise Governance",
              "Automated Reporting",
              "Academic Intelligence",
              "Global Scale"
            ].map((tagline, i) => (
              <div key={`dup-${i}`} className="flex items-center gap-4 opacity-100 transition-all cursor-pointer group-hover:[animation-play-state:paused] hover:scale-105">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{tagline}</span>
              </div>
            ))}
          </div>
      </div>

      {/* Deep Capabilities Grid */}
      <section id="features" className="py-48 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 mb-32 items-end">
            <div>
              <motion.span {...fadeInUp} className="text-indigo-600 font-black uppercase tracking-[0.3em] text-sm mb-6 block">Capabilities</motion.span>
              <h2 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">Engineered for the elite.</h2>
            </div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">Most school systems are built for data entry. EduTrack is built for discovery. Unlock patterns in student performance you never knew existed.</p>
          </div>

          <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard icon={BarChart} title="Dynamic Result Engine" desc="Complex grading scales, weighted averages, and automated ranking calculated in microseconds." color="indigo" />
            <FeatureCard icon={Database} title="Multi-Tenant Vault" desc="Every institution has a dedicated encrypted silo. Absolute data isolation guaranteed by architecture." color="blue" />
            <FeatureCard icon={Cpu} title="Automated Reporting" desc="Generate professional, branded PDF results for thousands of students with a single click." color="purple" />
            <FeatureCard icon={Users} title="Permissions Matrix" desc="Granular access control from Principals to temporary staff with a complete governance audit log." color="rose" />
            <FeatureCard icon={Zap} title="Hyper-Sync" desc="Teachers enter data offline or on the move; our algorithm ensures zero-conflict central synchronization." color="emerald" />
            <FeatureCard icon={Lock} title="ISO Security" desc="Bank-grade encryption for all PII data, ensuring compliance with global educational standards." color="cyan" />
          </motion.div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section id="governance" className="py-48 bg-slate-900 border-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent)]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="text-center mb-32">
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">Integrates with your ecosystem.</h2>
              <p className="text-indigo-200 text-xl font-medium max-w-2xl mx-auto">EduTrack doesn&apos;t work in isolation. Use our industrial APIs to connect with existing ERPs or LMS platforms.</p>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Google Workspace', icon: Globe },
                { name: 'Microsoft 365', icon: Layers },
                { name: 'Enterprise API', icon: Database },
                { name: 'Cloud Storage', icon: Globe },
                { name: 'Attendance Sync', icon: Clock },
                { name: 'Biometric Link', icon: Cpu },
                { name: 'Parent Connect', icon: Users },
                { name: 'Student Portal', icon: GraduationCap }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <item.icon className="text-indigo-400 group-hover:scale-110 transition-transform" size={24} />
                  <span className="text-white font-bold tracking-tight">{item.name}</span>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-48">
        <div className="max-w-7xl mx-auto px-6">
           <div className="mb-24 flex justify-between items-end gap-10">
              <h2 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">Stories from the frontline.</h2>
              <div className="flex gap-4">
                 {[1,2].map(i => <div key={i} className={`w-12 h-1.5 rounded-full ${i === 1 ? 'bg-indigo-600' : 'bg-slate-200'}`} />)}
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              {[
                { 
                  quote: "EduTrack didn&apos;t just digitize our results; it redefined how we understand student progress. The analytics are game-changing.", 
                  author: "Dr. Elena Vance", 
                  role: "Head of Academic Board", 
                  inst: "Horizon International" 
                },
                { 
                  quote: "Transitioning 3000 students to a new system in 48 hours seemed impossible until we saw the EduTrack onboarding engine.", 
                  author: "Marcus Aurelius", 
                  role: "Administrative Director", 
                  inst: "Global Prep School" 
                }
              ].map((t, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="p-16 rounded-[3rem] bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between h-full group"
                >
                  <div className="flex gap-1 mb-8">
                    {[1,2,3,4,5].map(j => <Star key={j} className="w-5 h-5 fill-indigo-600 text-indigo-600" />)}
                  </div>
                  <p className="text-3xl font-bold text-slate-900 italic mb-12">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 overflow-hidden shadow-xl" />
                    <div>
                      <div className="text-xl font-black text-slate-900">{t.author}</div>
                      <div className="text-indigo-600 font-bold text-sm tracking-widest uppercase">{t.role} — {t.inst}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-48 pb-64 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-6xl mx-auto rounded-[4rem] bg-slate-900 p-20 lg:p-32 relative overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent)]" />
          <h2 className="text-5xl lg:text-8xl font-black text-white mb-12 tracking-tighter relative z-10">Stop managing. <br /> Start governing.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link href="/register" className="px-12 py-7 bg-white text-slate-900 rounded-[2.5rem] font-black text-xl hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95">
              Launch Now <ArrowRight size={24} />
            </Link>
            <Link href="/login" className="px-12 py-7 border border-white/20 text-white rounded-[2.5rem] font-black text-xl hover:bg-white/10 transition-all active:scale-95">
              Admin Gateway
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Industrial Footer */}
      <footer className="bg-white border-t border-slate-200 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-20 mb-32">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <GraduationCap className="text-white h-6 w-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">EduTrack<span className="text-indigo-600">.</span></span>
              </div>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mb-10">
                The absolute operating system for academic governance. Designed with multi-tenant architecture and ISO-grade security.
              </p>
              <div className="flex gap-6">
                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                  <Link key={i} href="#" className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Icon size={20} />
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-8">Infrastructure</h5>
              <div className="flex flex-col gap-5 text-slate-500 font-bold">
                <Link href="#" className="hover:text-indigo-600 transition-colors">Governance Model</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Result Engine</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Audit Vault</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">API Runtime</Link>
              </div>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-8">Ecosystem</h5>
              <div className="flex flex-col gap-5 text-slate-500 font-bold">
                <Link href="#" className="hover:text-indigo-600 transition-colors">Integrations</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Partnerships</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Developers</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
              </div>
            </div>

            <div>
              <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-8">Institutions</h5>
              <div className="flex flex-col gap-5 text-slate-500 font-bold">
                <Link href="/register" className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-200 underline-offset-8 transition-colors">Launch Deployment</Link>
                <Link href="/login" className="hover:text-indigo-600 transition-colors">Admin Console</Link>
                <Link href="/login?mode=independent" className="hover:text-indigo-600 transition-colors">Educator Mode</Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">Support Center</Link>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <div className="flex items-center gap-8">
               <p>© {new Date().getFullYear()} EDUTRACK_SYSTEM_OS</p>
               <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200" />
               <p className="hidden md:block">ISO_27001_COMPLIANT</p>
            </div>
            <div className="flex gap-10">
              <Link href="#" className="hover:text-slate-900 transition-colors">Legal_Statutes</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Security_Protocol</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Privacy_Architecture</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

