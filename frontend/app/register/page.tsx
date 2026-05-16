"use client"

import Link from 'next/link'

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Public access enabled</h1>
        <p className="mt-2 text-sm text-slate-400">
          User registration is no longer required. The inventory dashboard is now open for everyone.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard"
            className="block w-full rounded-3xl bg-cyan-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="block w-full rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm text-white transition hover:bg-white/10"
          >
            Back to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
