import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Inventory Management System',
  description: 'Modern inventory SaaS with AI assistant, analytics, and order management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
