"use client"

import { useEffect, useState } from 'react'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'
import { fetchSuppliers, createSupplier } from '../../../services/api'
import type { Supplier } from '../../../types'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSuppliers = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchSuppliers()
        setSuppliers(data)
      } catch {
        setError('Unable to load suppliers. Please check your backend connection.')
      } finally {
        setLoading(false)
      }
    }

    loadSuppliers()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const newSupplier = await createSupplier({
        name,
        phone,
        address,
        email,
      })
      setSuppliers((current) => [newSupplier, ...current])
      setName('')
      setPhone('')
      setAddress('')
      setEmail('')
    } catch {
      setError('Unable to add supplier. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto py-10">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Sidebar />
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Suppliers</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Manage supplier profiles</h1>
                </div>
              </div>
            </div>

            <Card title="Add supplier">
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Supplier name"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  />
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone"
                    className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                  />
                </div>
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={4}
                  placeholder="Address"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add supplier
                </button>
              </form>
              {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
            </Card>

            <Card title="Supplier list">
              {loading && <p className="text-slate-400">Loading suppliers…</p>}
              {!loading && suppliers.length === 0 && <p className="text-slate-400">No suppliers found.</p>}
              {suppliers.length > 0 && (
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-white">{supplier.name}</p>
                          <p className="text-sm text-slate-400">{supplier.email || supplier.phone}</p>
                        </div>
                        <span className="text-sm text-slate-500">{supplier.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
