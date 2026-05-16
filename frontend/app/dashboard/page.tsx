'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Box, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Sidebar } from '../../components/sidebar'
import { fetchDashboardSummary, sendAIMessage } from '../../services/api'
import type { DashboardSummary } from '../../types'

const chartColors = ['#22c55e', '#0ea5e9', '#6366f1', '#14b8a6']

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('Which products need reorder?')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setDataLoading(true)
        setError(null)
        const dashboardData = await fetchDashboardSummary()
        setSummary(dashboardData)
      } catch {
        setError('Unable to load dashboard data. Please refresh the page.')
      } finally {
        setDataLoading(false)
      }
    }

    loadSummary()
  }, [])

  const handleAI = async () => {
    setError(null)
    setAiLoading(true)
    try {
      const result = await sendAIMessage(aiPrompt)
      setAiResponse(result.assistant)
    } catch {
      setError('AI assistant failed to generate a response. Please try again.')
    } finally {
      setAiLoading(false)
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
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Inventory analytics overview</h1>
                </div>
                <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Realtime performance insights
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm text-slate-400">Total products</p>
                <p className="mt-4 text-4xl font-semibold text-white">{summary?.totalProducts ?? '--'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm text-slate-400">Low stock products</p>
                <p className="mt-4 text-4xl font-semibold text-amber-400">{summary?.lowStockCount ?? '--'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm text-slate-400">Total orders</p>
                <p className="mt-4 text-4xl font-semibold text-white">{summary?.totalOrders ?? '--'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <p className="text-sm text-slate-400">Monthly revenue</p>
                <p className="mt-4 text-4xl font-semibold text-emerald-400">
                  ${summary?.totalRevenue.toFixed(2) ?? '--'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Sales trend</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Monthly performance</h2>
                  </div>
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-6 h-72">
                  {dataLoading ? (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading chart…
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary?.monthlySales ?? []} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
                        <Bar dataKey="revenue" fill="#22c55e" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Category breakdown</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Top categories</h2>
                  </div>
                  <Box className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary?.categoryBreakdown ?? []}
                        dataKey="count"
                        nameKey="category"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={4}
                      >
                        {(summary?.categoryBreakdown ?? []).map((entry, index) => (
                          <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip wrapperStyle={{ backgroundColor: '#0f172a', borderRadius: 12 }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Low stock alert</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Critical inventory</h2>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="mt-6 space-y-3">
                  {dataLoading ? (
                    <p className="text-slate-400">Loading low-stock products…</p>
                  ) : summary?.lowStockProducts?.length ? (
                    summary.lowStockProducts.map((product) => (
                      <div key={product.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{product.name}</p>
                            <p className="text-sm text-slate-400">SKU {product.sku}</p>
                          </div>
                          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                            {product.quantity} left
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">No low-stock products at the moment.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">AI recommendations</p>
                    <h2 className="mt-2 text-xl font-semibold text-white">Ask the inventory assistant</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="mt-6 space-y-4">
                  <textarea
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />

                  <button
                    type="button"
                    onClick={handleAI}
                    disabled={aiLoading}
                    className="inline-flex w-full items-center justify-center rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      'Get insight'
                    )}
                  </button>

                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-300">
                    <p className="text-slate-400">AI response</p>
                    <p className="mt-3 whitespace-pre-line">{aiResponse || 'Ask the assistant for reorder recommendations, low stock hazards, or sales insights.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
