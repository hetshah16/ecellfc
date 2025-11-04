"use client"
import { useState } from "react"
import axios from "axios"

export default function PaymentForm({ selected, user, setPay, setUser, setSelected}) {
  const [amount, setAmount] = useState("")
  const [phase, setPhase] = useState("ready")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const startPayment = (e) => {
    e.preventDefault()
    setError("")
    const a = Number(amount)
    if (!a || a <= 0) return setError("Enter a valid amount")
    if (a > user.coins) return setError("Insufficient balance")
    setPhase("askingPw")
  }

  const confirmPayment = async (e) => {
    e.preventDefault()
    setError("")
    setPhase("sending")

    try {
      const res = await axios.post("/api/transfer", {
        sender_id: user.user_id,
        sender_name: user.name,
        sender_email: user.email,
        password,
        receiver_id: selected.user_id,
        receiver_name: selected.name,
        receiver_email: selected.email,
        amount: Number(amount),
      })
      // setUser(prev => ({...prev, coins: prev.coins - Number(amount)}))
      setSuccess(res.data.message || "Payment successful")
      setPhase("done")
      setAmount("")
      setPassword("")
      setTimeout(() => {
        setSuccess("")
        setPhase("")
        setSelected(null);
      }, 3000)

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Payment failed")
      } else {
        setError("Network error")
        console.log(err)
      }
      setPhase("ready")
      setPassword("")
    }
  }

  const handleForgot = async () => {
    const email = prompt("Enter your account email to receive a reset link:")
    if (!email) return
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      alert("If that email exists, a reset link was sent.")
    } catch (err) {
      alert("Unable to process request.")
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {phase === "ready" && (
        <form onSubmit={startPayment} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Amount (E-coins)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-2">Available: {user?.coins} ⓔ</p>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-1/2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Continue
            </button>
            <button
              onClick={() => setPay(false)}
              className="w-1/2 py-3 bg-muted text-foreground hover:bg-primary/90 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {phase === "askingPw" && (
        <form onSubmit={confirmPayment} className="space-y-5">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-sm">
              Confirm payment of <span className="font-bold text-primary">{amount} ⓔ</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Enter your password to confirm</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setPhase("ready")}
              className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          <button
            type="button"
            onClick={handleForgot}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Forgot password?
          </button>
        </form>
      )}

      {phase === "sending" && (
        <div className="text-center py-8">
          <div className="inline-block mb-4">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground font-medium">Processing payment...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}
    </div>
  )
}
