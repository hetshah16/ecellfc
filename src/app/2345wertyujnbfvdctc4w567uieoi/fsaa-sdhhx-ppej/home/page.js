"use client"

import { useEffect, useMemo, useState } from "react"
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
  const [loading, setLoading] = useState(true)

  const [admin, setAdmin] = useState(null);
  const router = useRouter()

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
        setLoading(false)
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
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  /* ================= FILTERS ================= */

  const filteredUsers = useMemo(() => {
    const q = userQ.toLowerCase()
    if (!q) return []
    return users.filter(
      u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.user_id).includes(q)
    )
  }, [userQ, users])

  const filteredStalls = useMemo(() => {
    const q = stallQ.toLowerCase()
    if (!q) return []
    return stalls.filter(
      s =>
        s.stall_name?.toLowerCase().includes(q) ||
        String(s.stall_id).includes(q)
    )
  }, [stallQ, stalls])

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedUser || !amount || !reason) {
      alert("Missing fields")
      return
    }

    try {
      if (mode === "stall-user") {
        if (!selectedStall) {
          alert("Select stall")
          return
        }

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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
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
              <input
                placeholder="Search stall..."
                value={stallQ}
                onChange={e => setStallQ(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {filteredStalls.map(s => (
                <button
                  key={s.stall_id}
                  onClick={() => { setSelectedStall(s); setStallQ("") }}
                  className="block w-full text-left p-2 hover:bg-muted"
                >
                  {s.stall_name} (#{s.stall_id})
                </button>
              ))}
            </div>
          )}
          
          {/* USER SEARCH */}
          <div>
            <input
              placeholder="Search user..."
              value={userQ}
              onChange={e => setUserQ(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {filteredUsers.map(u => (
              <button
                key={u.user_id}
                onClick={() => { setSelectedUser(u); setUserQ("") }}
                className="block w-full text-left p-2 hover:bg-muted"
              >
                {u.name} • {u.email}
              </button>
            ))}
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
              className="w-full bg-primary text-white py-2 rounded"
            >
              Submit
            </button>
          </div>
          {selectedStall && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Selected Stall</div>
              <div className="font-semibold">{selectedStall.stall_name}</div>
              <div className="text-xs text-muted-foreground">
                #{selectedStall.stall_id} • {selectedStall.email}
              </div>
              <button
                onClick={() => setSelectedStall(null)}
                className="text-xs text-destructive mt-2"
              >
                Change stall
              </button>
            </div>
          )}
          {selectedUser && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-1">Selected User</div>
              <div className="font-semibold">{selectedUser.name}</div>
              <div className="text-xs text-muted-foreground">
                #{selectedUser.user_id} • {selectedUser.email}
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-xs text-destructive mt-2"
              >
                Change user
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
