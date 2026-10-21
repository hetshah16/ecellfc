"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import BrandMark from "./amalfi/BrandMark"

const links = [
  { href: "/home", label: "Browse Stalls" },
  { href: "/self-recharge", label: "Recharge" },
  { href: "/transfer", label: "Transfer" },
  { href: "/profile", label: "Profile" },
  { href: "/history", label: "History" },
  { href: "/best-eater", label: "Best Eater" },
]

export default function Navbar({ coins, user, showRecharge = false }) {
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
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
        <nav className="liquid-glass mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 rounded-full pl-3 pr-2 sm:pl-4">
          {/* Logo + username */}
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/home" className="transition hover:opacity-85" aria-label="E-Cell FC home">
              <BrandMark labelClassName="hidden sm:inline" />
            </Link>

            <Link
              href="/profile"
              className="glass-pill hidden max-w-[10rem] truncate rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground lg:block"
            >
              {user}
            </Link>
          </div>

          {/* Desktop segmented navigation */}
          <div className="hidden items-center gap-0.5 rounded-full bg-muted p-1 ring-1 ring-white/70 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all lg:px-4 ${
                  isActive(l.href)
                    ? "bg-white text-primary shadow-md ring-1 ring-white"
                    : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop logout */}
          <div className="hidden md:block">
            <button
              onClick={handleLogout}
              className="glass-pill rounded-full px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-white/80"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="glass-pill grid h-11 w-11 place-items-center rounded-full transition md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {open && (
          <div className="liquid-glass animate-rise mx-auto mt-2 max-w-7xl overflow-hidden rounded-3xl p-2 md:hidden">
            {user && (
              <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {user}
              </p>
            )}
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-2xl px-4 py-3 font-semibold transition-colors ${
                  isActive(l.href) ? "bg-white text-primary shadow-sm" : "text-foreground hover:bg-white/60"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl px-4 py-3 text-left font-semibold text-destructive transition-colors hover:bg-white/60"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Balance */}
      <div className="mx-auto mt-4 flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
        <div className="glass-pill flex items-center gap-2 rounded-full p-1.5 sm:gap-3">
          <div className="flex items-center gap-2 pl-2 sm:gap-3 sm:pl-3">
            <p className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
              Your Balance
            </p>
            <div className="serif min-w-0 max-w-24 truncate text-xl font-bold tabular-nums text-primary sm:max-w-32 sm:text-2xl">
              {coins}
            </div>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lemon text-base font-bold text-navy shadow-sm ring-2 ring-white sm:h-9 sm:w-9 sm:text-lg">
              ⓔ
            </span>
          </div>
          {showRecharge && (
            <Link
              href="/self-recharge"
              className="flex h-9 shrink-0 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:h-10 sm:px-4 sm:text-sm"
            >
              Recharge
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
