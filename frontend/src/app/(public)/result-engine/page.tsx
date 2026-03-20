export default function ResultEnginePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_100%)] pointer-events-none" />
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-8xl font-black tracking-tighter mb-8 leading-none uppercase">
            Result <br /> <span className="text-indigo-600">Engine.</span>
          </h1>
          <p className="text-slate-400 font-bold text-xl uppercase tracking-[0.2em] mb-12">Linear Regression & Predictive Scoring Model v4.0.1</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-24">
            <div className="space-y-6 p-10 rounded-[3rem] bg-indigo-900/10 border border-indigo-500/20 backdrop-blur-3xl">
              <h3 className="text-2xl font-black uppercase tracking-widest text-indigo-400">01. Dynamic Scaling</h3>
              <p className="text-slate-300 leading-relaxed font-medium">Automatic curve generation based on cohort difficulty and historical performance vectors. Ensures statistically sound grade distribution.</p>
            </div>
            <div className="space-y-6 p-10 rounded-[3rem] bg-indigo-900/10 border border-indigo-500/20 backdrop-blur-3xl">
              <h3 className="text-2xl font-black uppercase tracking-widest text-indigo-400">02. Cross-Verification</h3>
              <p className="text-slate-300 leading-relaxed font-medium">Triple-redundancy scoring verification with automated anomaly detection for potential grading bias or error.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
