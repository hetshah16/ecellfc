"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import BrandMark from "../components/amalfi/BrandMark"
import PasswordInput from "../components/PasswordInput"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailsent, setemailsent] = useState(false);
  const [emailsending, setemailsending] = useState(false);
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
      await axios.post("/api/login", { email, password })
      setSuccess(true)
      router.push("/home");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Invalid login")
      } else {
        setError("Failed to login. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }
  const handleForgot = async () => {
    const email = prompt("Enter your account email to receive a reset link:")
    if (!email) return
    setemailsending(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setemailsending(false);
      setemailsent(true);
      setTimeout(() => { setemailsent(false); }, 4000);
      // alert("If that email exists, a reset link was sent.")
    } catch (err) {
      alert("Unable to process request.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="glass-pill flex items-center rounded-full py-1.5 pl-1.5 pr-4 transition hover:opacity-85">
          <BrandMark />
        </Link>
      </div>

      {/* Form Container */}
      <div className="w-full max-w-md">
        <div className="liquid-glass animate-rise overflow-hidden rounded-[2rem]">
          <div className="tile-band" />
          <div className="p-7 sm:p-9">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="script text-xl text-gold">Bentornato</p>
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Login in to your account</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none transition-all"
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/40 rounded-xl text-destructive text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/40 rounded-xl text-green-700 text-sm">
                Login successful! Redirecting...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-full transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-border text-center text-sm space-y-3">
            <p className="text-muted-foreground">
              {"Don't have an account?"}{" "}
              <Link href="/signup" className="inline-block py-2 text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
            {emailsent ? (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm">
                If that email exists, a reset link was sent.
              </div>
            ):(
              emailsending ? (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm">
                  Sending reset link...
                </div>
              ) : (
                <button
                type="button"
                onClick={handleForgot}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 rounded-full hover:bg-white/50">
                Forgot password?
              </button>
              )
            )}
            
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

