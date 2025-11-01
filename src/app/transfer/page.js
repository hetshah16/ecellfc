"use client"

import { useEffect, useState, useMemo } from "react"
import Navbar from "../components/Navbar"
import { useRouter } from "next/navigation"

export default function TransferPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState(null)
  const [senderEmail, setSenderEmail] = useState("")
  const [password, setPassword] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setUsers(Array.isArray(data) ? data : [])
      })
      .catch((e) => console.error(e))
    return () => (mounted = false)
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s)
    )
  }, [q, users])

  const handleSelect = (user) => {
    setSelected(user)
    setMsg(null)
    setErr(null)
  }

  const handleSend = async () => {
    setErr(null)
    setMsg(null)
    if (!selected) return setErr("Select a recipient")
    const amt = Number(amount)
    if (!amt || amt <= 0) return setErr("Enter a valid amount")
    if (!senderEmail || !password) return setErr("Enter your email and password")

    setLoading(true)
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_email: senderEmail,
          password,
          receiver_id: selected.user_id,
          receiver_name: selected.name,
          amount: amt,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data?.error || "Transfer failed")
      } else {
        setMsg(`Transferred ${amt} ⓔ to ${selected.name}. Transaction ID: ${data.transaction_id}`)
        setSelected(null)
        setAmount("")
        setPassword("")
        setSenderEmail("")
        const updated = await fetch("/api/admin/users").then((r) => r.json())
        setUsers(Array.isArray(updated) ? updated : users)
      }
    } catch (e) {
      console.error(e)
      setErr("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar coins = {user?.coins} user = {user?.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transfer E-coins</h1>
          <p className="text-muted-foreground">Send E-coins to your friends securely</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Users List */}
          {!selected && (<div className="md:col-span-1">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search Recipients</label>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name, email, or ID..."
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                ) : (
                  filtered.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => handleSelect(u)}
                      className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${selected?.user_id === u.user_id
                          ? "bg-primary/10 border-l-2 border-primary"
                          : "hover:bg-muted/50"
                        }`}
                    >
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        #{u.user_id} • {u.email}
                      </div>
                      <div className="text-sm text-primary mt-1 font-semibold">{u.coins} ⓔ</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>)}

          {selected && (
            <div className="md:col-span-2">
              <div className="bg-card border border-border rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Send E-coins</h2>

                {!selected ? (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-sm mb-4">
                    Select a recipient from the list to get started
                  </div>
                ) : (
                  <div className="mb-8 p-5 bg-muted/50 border border-border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Sending to</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{selected.name}</p>
                        <p className="text-xs text-muted-foreground">Email ID: {selected.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="text-2xl font-bold text-primary">{selected.coins} ⓔ</p>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="space-y-5"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Email</label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (E-coins)</label>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={!selected}
                      placeholder={selected ? "Enter amount" : "Select recipient first"}
                      className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={!selected || loading}
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-semibold rounded-lg transition-colors"
                    >
                      {loading ? "Sending..." : "Send"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(null)
                        setAmount("")
                        setPassword("")
                        setSenderEmail("")
                        setMsg(null)
                        setErr(null)
                      }}
                      className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>

                  {err && (
                    <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                      {err}
                    </div>
                  )}

                  {msg && (
                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                      {msg}
                    </div>
                  )}
                </form>
              </div>
            </div>)}

        </div>
      </main>
    </div>
  )
}
