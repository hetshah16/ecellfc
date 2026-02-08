"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function Navbar({ coins, user }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout")
      router.push("/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const isActive = (path) => pathname === path

  return (
    <div>
      <header className="sticky top-0 z-40 bg-card/50 backdrop-blur-md border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/profile" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="hidden sm:inline">E-Cell FC 2k26</span>
            <div className="justify-end flex gap-2">
              <p className="text-xl text-muted-foreground flex justify-center items-center"></p>
              <div className="text-xl text-muted-foreground">{user}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/home"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive("/home")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              Browse
            </Link>
            <Link
              href="/transfer"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive("/transfer")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              Transfer
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive("/profile")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              Profile
            </Link>
            <Link
              href="/history"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive("/history")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              History
            </Link>
            <Link
              href="/best-eater"
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${isActive("/best-eater")
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              Best Eater
            </Link>
          </div>

          {/* Desktop Logout Button */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-500 hover:bg-muted transition-colors font-medium"
            >
              Logout
            </button>
          </div>
                
          {/* Mobile Hamburger */}
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
            <Link href="/home" className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium">
              Browse
            </Link>
            <Link
              href="/transfer"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Transfer
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Profile
            </Link>
            <Link
              href="/history"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              History
            </Link>
            <Link
              href="/best-eater"
              className="block px-4 py-3 text-foreground hover:bg-muted transition-colors font-medium"
            >
              Best Eater
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-500 hover:bg-muted transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </header>
      <div className="mt-3 flex justify-end items-center h-12 px-6">
        <div className="flex gap-1">
          <p className="text-xl text-muted-foreground flex items-center">
            Your Balance:
          </p>
          <div className="text-2xl font-bold text-primary">{coins} ⓔ</div>
        </div>
      </div>



    </div>
  )
}
