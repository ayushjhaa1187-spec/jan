export default function IntegrationsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">Integrations <br /> <span className="text-indigo-600">Ecosystem.</span></h1>
        <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-12">Universal Hub for Educational Interoperability</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {['Google Workspace', 'Microsoft 365', 'Canvas LMS', 'Moodle', 'Turnitin', 'Clever', 'Aeries', 'PowerSchool'].map((item) => (
             <div key={item} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-crosshair">
                <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-4">Certified Link</p>
                <p className="text-xl font-black">{item}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
