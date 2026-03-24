export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">Developer <br /> <span className="text-indigo-600">Portal.</span></h1>
        <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-12">Extend the Governing Intelligence</p>
        <div className="bg-[#010409] p-12 rounded-[3rem] border border-white/10 font-mono shadow-2xl">
           <div className="flex gap-4 mb-8">
              <div className="w-12 h-1 bg-indigo-500 rounded-full" />
              <div className="w-8 h-1 bg-white/20 rounded-full" />
           </div>
           <p className="text-emerald-400 mb-4">$ npm install @edutrack/sdk-core</p>
           <p className="text-slate-400 mb-8">{'// Initializing secure auth handshake'}</p>
           <p className="text-indigo-400">const sdk = new EduTrack({'{ apiKey: process.env.EDU_KEY }'});</p>
        </div>
      </div>
    </div>
  )
}
