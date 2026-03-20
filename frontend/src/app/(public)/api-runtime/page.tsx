export default function APIRuntimePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">API <br /> Runtime.</h1>
        <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em]">Distributed Academic Operating Protocol</p>
        <div className="mt-12 bg-[#0d1117] p-12 rounded-[2.5rem] border border-white/5 font-mono text-sm shadow-2xl">
          <p className="text-emerald-400 mb-2">// EduTrack Runtime System 2026.4</p>
          <p className="text-indigo-400">INITIALIZING CLUSTER HANDSHAKE...</p>
          <p className="text-slate-500">Node ID: EDU-RT-112-X4</p>
          <p className="text-slate-500">Core Status: READY</p>
          <p className="text-indigo-400 mt-6">curl -X GET "https://api.edutrack.app/v1/ready"</p>
          <p className="text-slate-400">&gt; {'{ "status": "operational", "latency": "14ms" }'}</p>
        </div>
      </div>
    </div>
  )
}
