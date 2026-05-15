"use client"

import Link from 'next/link'
import { useAuthContext } from './AuthProvider'

export function Sidebar() {
  const { logout } = useAuthContext()

  return (
    <aside className="w-full max-w-[300px] shrink-0 rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-200">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Inventory Admin</h3>
        </div>
        <nav className="space-y-2">
          <Link className="block rounded-2xl px-4 py-3 hover:bg-white/5" href="/dashboard">
            Dashboard
          </Link>
          <Link className="block rounded-2xl px-4 py-3 hover:bg-white/5" href="/dashboard/products">
            Products
          </Link>
          <Link className="block rounded-2xl px-4 py-3 hover:bg-white/5" href="/dashboard/orders">
            Orders
          </Link>
          <Link className="block rounded-2xl px-4 py-3 hover:bg-white/5" href="/dashboard/ai">
            AI Assistant
          </Link>
        </nav>
        <button
          onClick={() => logout()}
          className="w-full rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200 transition hover:bg-red-500/20"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
