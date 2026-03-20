export default function MarketplacePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <h1 className="text-7xl font-black tracking-tighter mb-8 leading-none uppercase">App <br /> <span className="text-indigo-600">Marketplace.</span></h1>
        <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-20">Third-Party Governance Enhancements</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { name: 'AI Grader Pro', price: '$29/mo', desc: 'Handwriting recognition for automated paper scanning.' },
             { name: 'FeeVault Sync', price: '$49/mo', desc: 'Real-time billing integration for student financial clusters.' },
             { name: 'BusTracker Node', price: '$19/mo', desc: 'Secure transit monitoring for campus transport nodes.' }
           ].map((item) => (
             <div key={item.name} className="p-10 rounded-[3rem] bg-indigo-900/5 hover:bg-indigo-900/10 border border-white/5 transition-all">
                <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">Extension v1.0</p>
                <p className="text-2xl font-black mb-4 uppercase">{item.name}</p>
                <p className="text-slate-400 font-medium mb-8 uppercase text-[10px] tracking-widest leading-relaxed">{item.desc}</p>
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                   <p className="font-black text-lg">{item.price}</p>
                   <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">Install</button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
