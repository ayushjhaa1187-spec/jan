export default async function GovernancePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">
            Governance <br /> <span className="text-indigo-500">Protocol.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-12">Cluster-wide Policy Enforcement & Compliance v1.0.4</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
            <div className="space-y-6 p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl">
              <h3 className="text-2xl font-black uppercase tracking-widest text-indigo-400">01. Policy Engine</h3>
              <p className="text-slate-300 leading-relaxed font-medium">Automatic execution of institutional mandates via immutable smart-contracts. Ensures 100% adherence to academic standards across the entire ecosystem.</p>
            </div>
            <div className="space-y-6 p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl">
              <h3 className="text-2xl font-black uppercase tracking-widest text-indigo-400">02. Multi-Node Consensus</h3>
              <p className="text-slate-300 leading-relaxed font-medium">Distributed verification logic for grade submissions and transcript issuance. Eliminates single-point-of-failure vulnerabilities in academic records.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full" />
    </div>
  )
}
