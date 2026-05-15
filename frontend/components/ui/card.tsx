import { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 text-slate-300">{children}</div>
    </div>
  )
}
