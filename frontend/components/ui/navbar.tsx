import Link from 'next/link'

export function Navbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-white">
          AI Inventory
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/login" className="hover:text-white">
            Login
          </Link>
          <Link href="/register" className="hover:text-white">
            Register
          </Link>
        </nav>
      </div>
    </header>
  )
}
