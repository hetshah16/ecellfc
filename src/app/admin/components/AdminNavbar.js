"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AdminNavbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout")
      alert("You've been logged out.")
      router.push("/admin/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <nav className="liquid-glass max-w-7xl mx-auto pl-3 sm:pl-4 pr-2 h-16 rounded-full flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="serif flex items-center gap-2.5 font-bold text-lg">
          <div className="serif w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-md ring-1 ring-white/70">
            A
          </div>
          <span className="hidden sm:inline">Admin Console</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-0.5 rounded-full bg-muted p-1 ring-1 ring-white/70">
          <Link
            href="/admin/home"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Recharge
          </Link>
          <Link
            href="/admin/logs"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Logs
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="glass-pill rounded-full px-4 py-2 text-destructive hover:bg-white/80 transition-colors font-semibold text-sm"
        >
          Logout
        </button>
      </nav>
    </header>
  )
}
