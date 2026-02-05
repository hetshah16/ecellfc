"use client"

import { useEffect, useState, useMemo } from "react"
import Navbar from "../components/Navbar"
import { useRouter } from "next/navigation"
import axios from "axios"
import PaymentForm from "./PaymentForm"

export default function TransferPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [amount, setAmount] = useState("")
  const [user, setUser] = useState(null)
  const [q, setQ] = useState("")
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me")
        const res = await axios.post("/api/user", {
          user_id: r.data.user.user_id,
        })
        setUser(res.data)
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Please log in to access the transfer page.")
          router.push("/login")
        } else {
          console.error("Failed to fetch user:", err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router])

  
  // Fetch all users
    useEffect(() => {
    let mounted = true

    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/admin/users")
        if (!mounted) return

        const usersData = Array.isArray(res.data) ? res.data : []
        const filter2=usersData.filter((u) => u.user_id == user?.user_id);
        setUser(prev => ({...prev, coins: Number(filter2[0]?.coins)}))
        // Keep user_id column but skip logged-in user
        const filteredUsers = usersData.filter(
          (u) => u.user_id !== user?.user_id
        )

        setUsers(filteredUsers)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        if (user) setLoading(false)
      }
    }

    if (!user) fetchUsers()

    return () => {
      mounted = false
    }
  }, [user])

  // Filter users based on search query
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

  const handleSelect = (u) => {
    setSelected(u)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading transfer page...</p>
        </div>
      </div>
    )
  }

  if (!user) return null // or a loading spinner

  return (
    <div className="min-h-screen bg-background">
      <Navbar coins={user?.coins} user={user?.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Transfer E-coins</h2>
          <p className="text-muted-foreground">Send E-coins to your friends securely</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Users List */}
          <div className="md:col-span-1 space-y-4">
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
                <div>{!selected && (<div className="p-4 text-center text-muted-foreground">No users found</div>)}</div>
              ) : (
                filtered.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => {handleSelect(u); setQ("")}}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${selected?.user_id === u.user_id
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-muted/50"
                      }`}
                  >
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      #{u.user_id} • {u.email}
                    </div>
                    {/* <div className="text-sm text-primary mt-1 font-semibold">{u.coins} ⓔ</div> */}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Payment Form */}
          {selected && (
              <div className="bg-card border border-border rounded-xl p-4 mb-5">
              <p className="text-muted-foreground mb-2">Transfer Your E-coins to</p>
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="font-semibold">{selected.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="text-sm break-all">{selected.email}</div>
              </div>
            </div>

              <PaymentForm
                selected={selected}
                user={user}
                setUser={setUser}
                setPay={() => setSelected(null)} // close the form
                setSelected={setSelected}
              />
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}
