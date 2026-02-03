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
      <header className="sticky top-0 z-40 bg-card/50 backdrop-blur-md border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/seller/home"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="hidden sm:inline">Stall Console</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/seller/home"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isActive("/seller/home")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Home
            </Link>

            <Link
              href="/seller/profile"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isActive("/seller/profile")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Profile
            </Link>

            <Link
              href="/seller/logs"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isActive("/seller/logs")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Logs
            </Link>
          </div>

          {/* Desktop Logout */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-foreground hover:text-destructive transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
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
          <div className="md:hidden border-t border-border bg-card divide-y divide-border">
            <Link
              href="/seller/home"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/seller/logs"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Logs
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </header>
        <div className="mt-6 flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
          <div className="justify-end flex gap-2">
            <p className="text-xl text-muted-foreground flex justify-center items-center">Hi,</p>
            <div className="text-xl text-muted-foreground">{seller}</div>
          </div>
        </div>
    </div>
  )
}
