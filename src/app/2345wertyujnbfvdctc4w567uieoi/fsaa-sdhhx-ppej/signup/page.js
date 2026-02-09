"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "../../login/page.module.css"

export default function AdminSignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const validate = () => {
    if (!name) return "Name is required"
    if (!email) return "Email is required"
    if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email)) return "Enter a valid email"
    if (!password) return "Password is required"
    if (password.length < 6) return "Password must be at least 6 characters"
    if (password !== confirm) return "Passwords do not match"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const v = validate()
    if (v) return setError(v)

    try {
      setLoading(true)
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) return setError(data.error || "Something went wrong")
      router.push("/admin/login")
    } catch (err) {
      console.error(err)
      setError("Unable to create account. Try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1>Create Admin Account</h1>
          <p className={styles.subtitle}>Set up your platform account</p>
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
              autoComplete="new-password"
            />
          </label>
          <label className={styles.label}>
            Name 
            <input
              className={styles.input}
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENter Name"
              autoComplete="new-password"
            />
          </label>
            
          <label className={styles.label}>
            Confirm Password
            <input
              className={styles.input}
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <div className={styles.divider}>Already have an account?</div>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => router.push("/admin/login")}
            style={{
              background: "rgba(31,111,235,0.2)",
              color: "#00d9ff",
              borderTop: "1px solid rgba(31,111,235,0.3)",
            }}
          >
            Login 
          </button>
        </form>
      </div>
    </div>
  )
}
