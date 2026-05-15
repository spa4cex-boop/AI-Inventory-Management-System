import './globals.css'
import type { Metadata } from 'next'
import AuthProvider from '../components/AuthProvider'

export const metadata: Metadata = {
  title: 'AI Inventory Management System',
  description: 'Modern inventory SaaS with AI assistant, analytics, and order management.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
