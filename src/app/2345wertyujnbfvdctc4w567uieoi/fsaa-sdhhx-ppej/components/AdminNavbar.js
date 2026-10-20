"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useRef, useState } from "react"

export default function AdminNavbar() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const loggingOutRef = useRef(false)

  const handleLogout = async () => {
    if (loggingOutRef.current) return
    loggingOutRef.current = true
    setLoggingOut(true)
    try {
      await axios.post("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/logout")
      alert("You've been logged out.")
      router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
    } catch (err) {
      console.error("Logout failed", err)
      loggingOutRef.current = false
      setLoggingOut(false)
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
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/home"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Home 
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/add-stall"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Add Stalls
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/add-admins"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Add Admins
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/logs"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Logs
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/leaderboard"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Leaderboard
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/best-eater"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Best-Eater
          </Link>
          <Link
            href="/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/page-settings"
            className="px-4 py-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-white/70 transition-colors font-semibold text-sm"
          >
            Page Settings
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="glass-pill rounded-full px-4 py-2 text-destructive hover:bg-white/80 transition-colors font-semibold text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? (
            <span className="inline-flex items-center gap-2" role="status">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
              Logging out...
            </span>
          ) : "Logout"}
        </button>
      </nav>
    </header>
  )
}
