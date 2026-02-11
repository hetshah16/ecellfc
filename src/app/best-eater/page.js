"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"

export default function BestEaterPage() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [pageStatus, setPageStatus] = useState(null)
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
const limit = 10


  // 🔐 Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me")
        const res = await axios.post("/api/user", {
          user_id: r.data.user.user_id,
        })
        setUser(res.data)
      } catch (err) {
        router.push("/login")
      }
    }
    fetchUser()
  }, [router])

  // 📄 Check page status
  useEffect(() => {
    const checkPage = async () => {
      try {
        const page = await axios.get("/api/page-live?key=best_eater");
        setPageStatus(page.data)
      } catch (err) {
        console.error(err)
      }
    }
    checkPage()
  }, [])

  // 🏆 Fetch leaderboard if live
useEffect(() => {
  if (!pageStatus?.is_live) {
    setLoading(false)
    return
  }

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/best-eater?page=${page}&limit=${limit}`)
      setLeaders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  fetchLeaderboard()
}, [pageStatus, page])
const myIndex = leaders.findIndex(
  (u) => u.user_id === user?.user_id
)

const myRank =
  myIndex !== -1
    ? (page - 1) * limit + myIndex + 1
    : null

const me =
  myIndex !== -1
    ? leaders[myIndex]
    : null


  if (!user || !pageStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // 🚫 Page down
  if (!pageStatus.is_live) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar coins={user.coins} user={user.name} />

        <div className="flex items-center justify-center py-32">
          <div className="bg-card border rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">🍔 Best Eater</h2>
            <p className="text-muted-foreground">
              {pageStatus.down_message || "This page will be live soon"}
            </p>
          </div>
        </div>
      </div>
    )
  }
   const top3 = page===1?leaders.slice(0, 3):[];
  // ✅ Page live
  return (
    <div className="min-h-screen bg-background">
      <Navbar coins={user.coins} user={user.name} />
     

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6"> Best Eaters Leaderboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {top3.map((user, index) => (
            <div
              key={user.user_id}
              className={`rounded-2xl p-6 text-center shadow-md border
                ${
                  index === 0
                    ? "bg-yellow-50 border-yellow-300"
                    : index === 1
                    ? "bg-gray-50 border-gray-300"
                    : "bg-orange-50 border-orange-300"
                }
              `}
            >
              <div className="text-4xl mb-2">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </div>

              <h3 className="text-xl font-semibold text-blue-900">
                {user.name}
              </h3>

              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>

              <p className="mt-2 text-lg font-bold text-primary">
                {user.coins} ⓔ
              </p>
            </div>
          ))}
        </div>
         {me && (
            <div className="mb-6 bg-primary/10 border rounded-2xl">
              <div className="p-4 flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 text-center font-semibold">
                  #{myRank}
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="font-medium">
                    {me.name}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary text-white">
                      You
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {me.email}
                  </div>
                </div>

                {/* Coins */}
                <div className="font-semibold whitespace-nowrap">
                  {me.coins} ⓔ
                </div>
              </div>
            </div>
          )}

        <div className="bg-card border rounded-2xl overflow-hidden">
          {leaders.map((u, index) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between p-4 border-b last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold">#{(page - 1) * limit + index + 1}</span>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {u.email}
                  </div>
                </div>
              </div>

              <div className="font-semibold">
                {u.coins} ⓔ
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            ⬅ Previous
          </button>

          <span className="px-4 py-2 text-sm text-muted-foreground">
            Page {page}
          </span>

          <button
            disabled={leaders.length < limit}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>

      </main>
    </div>
  )
}
