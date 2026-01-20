"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import { useRouter } from "next/navigation"

export default function History() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const init = async () => {
      try {
        const me = await axios.get("/api/me")
        const userRes = await axios.post("/api/user", {
          user_id: me.data.user.user_id,
        })
        setUser(userRes.data)

        if (!userRes.data.pin) {
          alert("Set your pin first")
          router.push("/profile")
          return
        }

        const [t1, t2, t3] = await Promise.all([
          axios.get("/api/transferlog"),
          axios.get("/api/rechargelog"),
          axios.get("/api/transactionlog"),
        ])

        const combined = [
          ...t1.data,
          ...t2.data,
          ...t3.data,
        ].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )

        setTransactions(combined)
      } catch (err) {
        if (err.response && [401, 403].includes(err.response.status)) {
          router.push("/login")
        } else {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {user && <Navbar coins={user.coins} user={user.name} />}

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{tx.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`font-semibold text-sm sm:text-base ${
                    tx.amount < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
