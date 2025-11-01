"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: "#1e293b",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    padding: "1rem 1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  brand: {
    fontWeight: 800,
    color: "#ffffff",
    fontSize: "1.125rem",
    letterSpacing: "-0.5px",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    color: "#94a3b8",
    padding: "0.625rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    transition: "all 0.2s",
    fontSize: "0.95rem",
    cursor: "pointer",
    border: "none",
    background: "transparent",
  },
  linkHover: {
    color: "#00d9ff",
    background: "rgba(31,111,235,0.1)",
  },
  logout: {
    background: "linear-gradient(135deg, #1f6feb 0%, #00d9ff 100%)",
    color: "white",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    fontSize: "0.95rem",
  },
}

export default function SellerNavbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout")
      router.push("/seller/login")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <header style={styles.navbar}>
      <div style={styles.brand}>🍽️ Stall Console</div>

      <nav style={styles.links}>
        <Link
          href="/seller/home"
          style={styles.link}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = styles.linkHover.color
            e.currentTarget.style.background = styles.linkHover.background
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = styles.link.color
            e.currentTarget.style.background = styles.link.background
          }}
        >
          Home
        </Link>
        <Link
          href="/seller/logs"
          style={styles.link}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = styles.linkHover.color
            e.currentTarget.style.background = styles.linkHover.background
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = styles.link.color
            e.currentTarget.style.background = styles.link.background
          }}
        >
          Logs
        </Link>
        <button
          onClick={handleLogout}
          style={styles.logout}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(31,111,235,0.4)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          Logout
        </button>
      </nav>
    </header>
  )
}
