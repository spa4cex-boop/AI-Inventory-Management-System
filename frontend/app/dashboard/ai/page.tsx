"use client"

import { FormEvent, useState } from 'react'
import api from '../../../services/api'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('')
  const [insight, setInsight] = useState('')
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setInsight('')
    setRecommendation(null)

    try {
      const response = await api.post('/ai/assist', { prompt })
      setInsight(response.data.insight)
      setRecommendation(response.data.recommendation || null)
    } catch (err) {
      setError('Unable to contact the AI assistant. Please try again later.')
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
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">AI Assistant</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Ask the assistant</h1>
                  <p className="mt-2 text-slate-400">Create, update, and manage inventory operations with natural language.</p>
                </div>
              </div>
            </div>

            <Card title="Send a prompt to the AI assistant">
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  rows={6}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none focus:border-cyan-500"
                  placeholder="Ask me to create a product, update stock, or generate inventory recommendations..."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Processing…' : 'Send request'}
                  </button>
                  <p className="text-sm text-slate-400">AI CRUD support is enabled when the backend is running.</p>
                </div>
              </form>
              {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
              {insight && (
                <div className="mt-6 space-y-4 rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Assistant Insight</p>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{insight}</pre>
                  </div>
                  {recommendation && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Recommendation</p>
                      <p className="mt-2 text-slate-300">{recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
