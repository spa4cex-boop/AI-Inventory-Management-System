'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto grid h-screen place-items-center px-6">
        <div className="rounded-3xl border border-rose-500 bg-slate-900/80 p-10 text-center shadow-2xl shadow-rose-500/10">
          <h1 className="text-3xl font-semibold text-rose-300">Something went wrong</h1>
          <p className="mt-4 text-slate-300">An error occurred while loading the page. Please refresh or try again later.</p>
          <button className="mt-6 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
