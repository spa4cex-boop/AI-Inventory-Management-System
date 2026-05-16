"use client"

import Link from 'next/link'
import { AlertTriangle, Bell, Home, Package2, ShoppingBag, Users } from 'lucide-react'

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/products', label: 'Products', icon: Package2 },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Users },
  { href: '/dashboard/ai', label: 'AI Assistant', icon: AlertTriangle },
]

export function Sidebar() {
  return (
    <aside className="w-full max-w-[300px] shrink-0 rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-200">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Inventory Admin</h3>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link key={item.href} className="block rounded-2xl px-4 py-3 hover:bg-white/5" href={item.href}>
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Access</p>
          <p className="mt-2 font-medium text-slate-100">Public dashboard</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-400" />
            <span>Realtime alerts enabled</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
