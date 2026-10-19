"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"

export default function SellerNavbar({seller}) {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const isActive = (path) => pathname === path

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout")
      router.push("/seller/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <nav className="liquid-glass max-w-7xl mx-auto pl-3 sm:pl-4 pr-2 h-16 rounded-full flex items-center justify-between gap-3">
          {/* Brand */}
          <Link
            href="/seller/profile"
            className="serif flex items-center gap-2.5 font-bold text-lg hover:opacity-80 transition"
          >
            <div className="serif w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-md ring-1 ring-white/70">
              E
            </div>
            <span className="hidden sm:inline">Stall Console</span>
            {/* <div className="mt-6 flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16"> */}
              <div className="justify-end flex gap-2">
                <p className="text-xl text-muted-foreground flex justify-center items-center"></p>
                <div className="hidden lg:block glass-pill rounded-full px-3 py-1 font-sans text-sm font-medium text-muted-foreground">{seller}</div>
              </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5 rounded-full bg-muted p-1 ring-1 ring-white/70">
            <Link
              href="/seller/home"
              className={`px-4 py-1.5 rounded-full transition-all text-sm font-semibold ${
                isActive("/seller/home")
                  ? "bg-white text-primary shadow-md ring-1 ring-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }`}
            >
              Home
            </Link>

            <Link
              href="/seller/profile"
              className={`px-4 py-1.5 rounded-full transition-all text-sm font-semibold ${
                isActive("/seller/profile")
                  ? "bg-white text-primary shadow-md ring-1 ring-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }`}
            >
              Profile
            </Link>

            <Link
              href="/seller/logs"
              className={`px-4 py-1.5 rounded-full transition-all text-sm font-semibold ${
                isActive("/seller/logs")
                  ? "bg-white text-primary shadow-md ring-1 ring-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }`}
            >
              Payments
            </Link>
            <Link
              href="/seller/leaderboard"
              className={`px-4 py-1.5 rounded-full transition-all text-sm font-semibold ${
                isActive("/seller/leaderboard")
                  ? "bg-white text-primary shadow-md ring-1 ring-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }`}
            >
              Leaderboard
            </Link>
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="glass-pill rounded-full px-4 py-2 text-sm text-destructive hover:bg-white/80 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden glass-pill grid h-11 w-11 place-items-center rounded-full transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden liquid-glass animate-rise mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl p-2">
            <Link
              href="/seller/home"
              className="block rounded-2xl px-4 py-3 text-foreground hover:bg-white/60 transition-colors font-semibold"
            >
              Home
            </Link>
            <Link
              href="/seller/profile"
              className="block rounded-2xl px-4 py-3 text-foreground hover:bg-white/60 transition-colors font-semibold"
            >
              Profile
            </Link>
            <Link
              href="/seller/logs"
              className="block rounded-2xl px-4 py-3 text-foreground hover:bg-white/60 transition-colors font-semibold"
            >
              Payments
            </Link>
            <Link
              href="/seller/leaderboard"
              className="block rounded-2xl px-4 py-3 text-foreground hover:bg-white/60 transition-colors font-semibold"
            >
              Leaderboard
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl text-left px-4 py-3 text-destructive hover:bg-white/60 transition-colors font-semibold"
            >
              Logout
            </button>
          </div>
        )}
      </header>
        
    </div>
  )
}
