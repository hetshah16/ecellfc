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
    <header className="sticky top-0 z-40 bg-card/50 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <span className="hidden sm:inline">Admin Console</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/admin/home"
            className="px-4 py-2 text-foreground hover:text-primary rounded-lg hover:bg-muted/50 transition-colors font-medium text-sm"
          >
            Recharge
          </Link>
          <Link
            href="/admin/add-stall"
            className="px-4 py-2 text-foreground hover:text-primary rounded-lg hover:bg-muted/50 transition-colors font-medium text-sm"
          >
            Add Stalls
          </Link>
          <Link
            href="/admin/logs"
            className="px-4 py-2 text-foreground hover:text-primary rounded-lg hover:bg-muted/50 transition-colors font-medium text-sm"
          >
            Logs
          </Link>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-foreground hover:text-destructive transition-colors font-medium text-sm"
        >
          Logout
        </button>
      </nav>
    </header>
  )
}
