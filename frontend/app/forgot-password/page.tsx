"use client"

import Link from 'next/link'
import { useState } from 'react'
import { resetPassword } from '../../firebase/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      await resetPassword(email)
      setMessage('Password reset email sent. Check your inbox.')
    } catch {
      setError('Unable to send reset email. Verify your email address and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-400">Enter your email and we will send a password reset link.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email address"
            className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send reset link
          </button>
        </form>

        {message && <p className="mt-4 rounded-3xl bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</p>}
        {error && <p className="mt-4 rounded-3xl bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

        <p className="mt-6 text-sm text-slate-400">
          Remembered your password?{' '}
          <Link className="text-cyan-300 hover:text-cyan-200" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
