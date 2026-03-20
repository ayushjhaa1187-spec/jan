export default function PartnershipsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10 text-center">
        <h1 className="text-9xl font-black tracking-tighter mb-8 leading-none uppercase">Global <br /> <span className="text-indigo-600">Alignment.</span></h1>
        <p className="text-slate-400 font-bold text-2xl uppercase tracking-[0.4em] mb-20">Scaling Academic Excellence Together</p>
        <div className="max-w-2xl mx-auto space-y-8 text-left">
           <div className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Strategic Nodes</h2>
              <p className="text-slate-400 leading-relaxed font-medium">Join a network of 400+ institutions leveraging EduTrack for high-dimensional academic governance. Shared intelligence, shared success.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
