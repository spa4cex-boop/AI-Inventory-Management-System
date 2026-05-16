"use client"

import { useState } from 'react'
import { Sidebar } from '../../../components/sidebar'
import { Card } from '../../../components/ui/card'
import { sendAIMessage } from '../../../services/api'

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('What products should I reorder this week?')
  const [responseText, setResponseText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) {
      setError('Please enter a prompt for the AI assistant.')
      return
    }

    setLoading(true)
    setError(null)
    setResponseText('')

    try {
      const result = await sendAIMessage(prompt)
      setResponseText(result.assistant)
    } catch {
      setError('Unable to contact the AI assistant. Please verify your backend and API key.')
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
                  <h1 className="mt-3 text-3xl font-semibold text-white">Ask the inventory assistant</h1>
                  <p className="mt-2 text-slate-400">Get reorder suggestions, product insights, and inventory warnings in plain language.</p>
                </div>
              </div>
            </div>

            <Card title="Prompt the AI assistant">
              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  rows={6}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none focus:border-cyan-500"
                  placeholder="Example: Which categories are low in stock?"
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Asking AI…' : 'Send prompt'}
                  </button>
                  <p className="text-sm text-slate-400">Free model: deepseek/deepseek-chat:free</p>
                </div>
              </form>
              {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-4 text-red-300">{error}</p>}
              {responseText && (
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-200">
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">AI answer</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{responseText}</p>
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </main>
  )
}
