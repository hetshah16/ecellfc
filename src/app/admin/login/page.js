"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "../../login/page.module.css"
import axios from "axios"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!email) return "Email is required"
    if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email)) return "Enter a valid email"
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const v = validate()
    if (v) return setError(v)

    try {
      setLoading(true)
      const res = await axios.post("/api/admin/login", { email, password })
      router.push("/admin/home")
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Invalid login")
      } else {
        console.error(err)
        setError("Failed to login. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage your platform</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.label}>
            Email Address
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}
