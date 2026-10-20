"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../components/AdminNavbar"
import axios from "axios"

export default function SuperadminTransferPage() {
  const [mode, setMode] = useState("stall-user") // stall-user | reverse-recharge

  const [users, setUsers] = useState([])
  const [stalls, setStalls] = useState([])

  const [userQ, setUserQ] = useState("")
  const [stallQ, setStallQ] = useState("")

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedStall, setSelectedStall] = useState(null)

  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [adminLoading, setAdminLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const [admin, setAdmin] = useState(null);
  const router = useRouter()
  const loading = adminLoading || dataLoading

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/me")
        setAdmin(res.data.admin)
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.")
          router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
        } else {
          console.error("Failed to fetch Super admin:", err)
        }
      } finally {
        setAdminLoading(false)
      }
    }
    fetchAdmin()
  }, [router])


  /* ================= FETCH DATA ================= */

  useEffect(() => {

    const fetchAll = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          axios.get("/api/admin/users"),
          axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/getstalls")
        ])
        setUsers(uRes.data || [])
        setStalls(sRes.data || [])
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setDataLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ================= FILTERS ================= */

  const filteredUsers = useMemo(() => {
    const q = userQ.trim().toLowerCase()
    if (!q) return []
    return users.filter(
      u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.user_id).includes(q)
    )
  }, [userQ, users])

  const filteredStalls = useMemo(() => {
    const q = stallQ.trim().toLowerCase()
    if (!q) return []
    return stalls.filter(
      s =>
        s.stall_name?.toLowerCase().includes(q) ||
        String(s.stall_id).includes(q)
    )
  }, [stallQ, stalls])

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (submittingRef.current) return
    if (!selectedUser || !amount || !reason) {
      alert("Missing fields")
      return
    }
    if (mode === "stall-user" && !selectedStall) {
      alert("Select stall")
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    try {
      if (mode === "stall-user") {
        await axios.post("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/reverse-transaction", {
          stall_id: selectedStall.stall_id,
          stall_name: selectedStall.stall_name,
          stall_email: selectedStall.email,
          user_id: selectedUser.user_id,
          name: selectedUser.name,
          email: selectedUser.email,
          amount,
          reason
        })
      } else {
        await axios.post("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/reverse-recharge", {
          user_id: selectedUser.user_id,
          amount,
          reason
        })
      }

      alert("Transaction successful ✅")
      setSelectedUser(null)
      setSelectedStall(null)
      setAmount("")
      setReason("")
    } catch (err) {
      alert(err.response?.data?.error || "Failed")
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading superadmin data...</span>
        </div>
      </div>
    )
  }
  // console.log("USERS", users)
  // console.log("STALLS", stalls)
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Superadmin Transfers</h1>

        {/* MODE TOGGLE */}
        <div className="flex gap-4">
          <button
            onClick={() => setMode("stall-user")}
            className={`px-4 py-2 rounded ${mode === "stall-user" ? "bg-primary text-white" : "bg-muted"}`}
          >
            Stall ➜ User
          </button>
          <button
            onClick={() => setMode("reverse-recharge")}
            className={`px-4 py-2 rounded ${mode === "reverse-recharge" ? "bg-primary text-white" : "bg-muted"}`}
          >
            Reverse Recharge
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* STALL SEARCH */}
          {mode === "stall-user" && (
            <div>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search stall..."
                  value={stallQ}
                  onChange={e => setStallQ(e.target.value)}
                  className="w-full p-2 border rounded"
                  aria-label="Search stalls"
                />
                {stallQ.trim() && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-card shadow-lg">
                    {filteredStalls.length > 0 ? filteredStalls.map(s => (
                      <button
                        key={s.stall_id}
                        type="button"
                        onClick={() => { setSelectedStall(s); setStallQ("") }}
                        className="block w-full border-b p-2 text-left last:border-b-0 hover:bg-muted"
                      >
                        {s.stall_name} (#{s.stall_id})
                      </button>
                    )) : (
                      <div className="p-3 text-sm text-muted-foreground" role="status">
                        No stalls found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedStall && (
                <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                  <div className="mb-1 text-xs text-muted-foreground">Selected Stall</div>
                  <div className="font-semibold">{selectedStall.stall_name}</div>
                  <div className="text-xs text-muted-foreground">
                    #{selectedStall.stall_id} • {selectedStall.email}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStall(null)}
                    className="mt-2 text-xs text-destructive"
                  >
                    Change stall
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* USER SEARCH */}
          <div>
            <div className="relative">
              <input
                type="search"
                placeholder="Search user..."
                value={userQ}
                onChange={e => setUserQ(e.target.value)}
                className="w-full p-2 border rounded"
                aria-label="Search users"
              />
              {userQ.trim() && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border bg-card shadow-lg">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <button
                      key={u.user_id}
                      type="button"
                      onClick={() => { setSelectedUser(u); setUserQ("") }}
                      className="block w-full border-b p-2 text-left last:border-b-0 hover:bg-muted"
                    >
                      {u.name} • {u.email}
                    </button>
                  )) : (
                    <div className="p-3 text-sm text-muted-foreground" role="status">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedUser && (
              <div className="mt-3 rounded-lg border bg-muted/50 p-3">
                <div className="mb-1 text-xs text-muted-foreground">Selected User</div>
                <div className="font-semibold">{selectedUser.name}</div>
                <div className="text-xs text-muted-foreground">
                  #{selectedUser.user_id} • {selectedUser.email}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="mt-2 text-xs text-destructive"
                >
                  Change user
                </button>
              </div>
            )}
          </div>
            

          {/* FORM */}
          <div className="bg-card border rounded p-4 space-y-3">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded bg-primary py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2" role="status">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Processing...
                </span>
              ) : "Submit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
