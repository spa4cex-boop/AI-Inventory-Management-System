import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto py-24">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 shadow-2xl shadow-slate-950/20">
          <h1 className="text-5xl font-semibold tracking-tight">AI Inventory Management System</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            A modern inventory SaaS platform with AI forecasting, smart reorder automation, analytics dashboards, and role-based access.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/login" className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Sign in to access dashboard
            </Link>
            <Link href="/register" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
