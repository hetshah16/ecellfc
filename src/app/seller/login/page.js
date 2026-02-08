"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "../../login/page.module.css"
import axios from "axios"
import Link from "next/link"

export default function SellerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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
      const res = await axios.post("/api/seller/login", { email, password })
      setSuccess(true)
      router.push("/seller/home")
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
            E
          </div>
          <span>E-Cell FC 2k26</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                Signin successful! Redirecting...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              {loading ? "Loging in..." : "Login"}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  
  )
}



