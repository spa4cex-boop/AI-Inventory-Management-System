"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { useAuthContext } from '../../components/AuthProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading, signRegisterWithEmail, error } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    try {
      await signRegisterWithEmail(email, password)
      router.replace('/dashboard')
    } catch {
      setFormError('Unable to register. Please check your credentials and try again.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Create account</h1>
        <p className="mt-2 text-sm text-slate-400">Register with Firebase Authentication for secure SaaS access.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="Email address"
            className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
            required
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white outline-none"
            required
          />
          <button
            type="submit"
            className="w-full rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
          <p>
            Already have an account?{' '}
            <Link className="text-cyan-300 hover:text-cyan-200" href="/login">
              Sign in
            </Link>
          </p>
        </div>
        {(formError || error) && (
          <p className="mt-4 rounded-3xl bg-red-500/10 p-4 text-sm text-red-200">{formError || error}</p>
        )}
      </div>
    </main>
  )
}
