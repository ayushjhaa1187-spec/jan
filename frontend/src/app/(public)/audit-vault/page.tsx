export default function AuditVaultPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">
            Audit <br /> <span className="text-indigo-600">Vault.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-12">Immutable Ledger of Academic Governance v0.9 (Pre-Alpha)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
            <div className="space-y-6 p-10 rounded-[3rem] bg-slate-100/5 border border-white/10">
              <h3 className="text-2xl font-black uppercase tracking-widest text-indigo-400">SHA-256 Hashing</h3>
              <p className="text-slate-300 font-medium">Every record alteration is hashed and permanently timestamped. Total audit log transparency across the entire institution cluster.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
