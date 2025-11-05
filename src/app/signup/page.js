"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"
export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [pin, setPin] = useState("")
  const [settingpin,setSettingPin] = useState(false);
   const [confirmPin, setConfirmPin] = useState("")
  const [message, setMessage] = useState("")


  const validate = () => {
    if (!displayName.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match"
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const v = validate()
    if (v) return setError(v)

    try {
      setLoading(true);

      console.log("Sending:", { name: displayName, email, password });

      const signupRes = await axios.post("/api/signup", {
        name: displayName,
        email,
        password,
      });


      setSettingPin(true);
    } catch (err) {
      setError("Unable to create account. Try again later.")
    } finally {
      setLoading(false)
    }
  };

   const handleSetPin = async (e) => {
    e.preventDefault()

    if (pin.length !== 4 || confirmPin.length !== 4) {
      setMessage("PIN must be exactly 4 digits.")
      return
    }

    if (pin !== confirmPin) {
      setMessage("PINs do not match.")
      return
    }

    try {
      await axios.post("/api/setpin", {email, pin});
      await axios.post("/api/login", { email, password });
      console.log(email,pin)
        setMessage("✅ PIN set successfully. Redirecting to home...")
        // setSettingPin(false); 
     router.push("/home")
    } catch (error) {
      console.log("Set PIN error:", error.response?.data || error.message)
    }
  }

  return (
    <div>
      {!settingpin ? (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <span>E-Cell Food</span>
            </Link>
          </div>
  
          {/* Form Container */}
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-muted-foreground">Join our food challenge community</p>
              </div>
  
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
  
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
  
                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
  
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}
  
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg transition-colors"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>
  
              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      ):(
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Set Your Security PIN</h2>
          <p className="mb-6 text-muted-foreground">
            For added security, please set a 4-digit PIN to protect your account.
          </p>

          <form onSubmit={handleSetPin} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Set PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                minLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Enter 4-digit PIN"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="4"
                minLength="4"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Confirm PIN"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Set PIN
            </button>

            {message && (
              <p className="text-center mt-4 font-medium text-sm">{message}</p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
