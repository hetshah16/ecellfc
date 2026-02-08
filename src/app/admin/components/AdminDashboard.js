"use client"

import { useEffect, useState, useMemo } from "react"
import axios from "axios"

export default function AdminDashboard({ admin }) {
  const [users, setUsers] = useState([])
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let mounted = true
    console.log("Fetching users for admin dashboard")
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setUsers(Array.isArray(data) ? data : [])
      })
      .catch((e) => {
        console.error(e)
      })
    return () => (mounted = false)
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        String(u.user_id).includes(s),
    )
  }, [q, users])

  const handleSelect = (user) => {
    setSelected(user)
    setAmount("")
    setMsg(null)
    setErr(null)
  }

  const handleRecharge = async () => {
    if (!selected) return

    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setErr("Enter a valid amount (> 0)")
      return
    }

    setLoading(true)
    setErr(null)
    setMsg(null)

    try {
      const res = await axios.post("/api/admin/recharge", {
        user_id: selected.user_id,
        email: selected.email,
        name: selected.name,
        amount: amt,
        mode: admin.email,
      })

      setMsg(`Recharged ${amt} ⓔ to ${selected.name}.`)
      setSelected(null)
      setAmount("")

      
      const updatedRes = await axios.get("/api/admin/users")
      const updated = updatedRes.data
      setUsers(Array.isArray(updated) ? updated : users)
    } catch (e) {
      if (e.response) {
        setErr(e.response.data?.error || "Recharge failed")
      } else {
        setErr("Network error")
      }
      setTimeout(() => {
        setErr(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Users List */}
      <div className="lg:col-span-2">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Search Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold mb-4">User Directory</h2>
            <input
              className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search by name, email or ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Users List */}
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No users found</div>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handleSelect(u)}
                  className={`w-full p-4 text-left transition-colors ${
                    selected?.user_id === u.user_id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{u.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {u.user_id} • {u.email}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{u.coins ?? 0} ⓔ</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recharge Panel */}
      <div className="bg-card border border-border rounded-xl p-6 h-fit">
        <h3 className="text-lg font-semibold mb-6">Recharge E-coins</h3>

        {!selected ? (
          !err && !msg && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Select a user from the list to recharge</p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {/* User Details */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="font-semibold">{selected.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="text-sm break-all">{selected.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Current Balance</div>
                <div className="text-2xl font-bold text-primary">{selected.coins ?? 0} ⓔ</div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Amount (E-coins)</label>
              <input
                className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                placeholder="Enter amount"
              />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleRecharge}
                disabled={!selected || loading}
              >
                {loading ? "Processing..." : "Recharge"}
              </button>
              <button
                className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium transition-colors"
                onClick={() => {
                  setSelected(null)
                  setAmount("")
                  setMsg(null)
                  setErr(null)
                }}
              >
                Clear
              </button>
            </div>
          </div>
          )}

          {/* Messages */}
          {err && (
            <div className="p-3 mt-4 bg-destructive/10 border border-destructive rounded-lg text-sm text-destructive">
              {err}
            </div>
          )}
          {msg && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {msg}
            </div>
          )}
          {msg && (
            <button
              onClick={() => {
                setMsg(null)
                setErr(null)
              }}
              className="mt-4 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Done
            </button>
     
          )}
      </div>
    </div>
  )
}
