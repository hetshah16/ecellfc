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

        <div className="flex items-center justify-center px-4 py-24 sm:py-32">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              Coming Soon
            </span>
            <h2 className="mt-4 text-2xl font-bold">Best Eaters Leaderboard</h2>
            <p className="mt-2 break-words text-sm text-muted-foreground">
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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Best Eaters Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rankings based on E-Coins spent across all stalls
          </p>
        </div>

        {top3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {top3.map((u, index) => (
              <div
                key={u.user_id}
                className={`min-w-0 rounded-2xl border bg-card p-5 shadow-sm ${
                  index === 0 ? "border-lemon" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-lemon text-navy"
                        : index === 1
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place"}
                  </span>
                </div>

                <h3 className="mt-4 truncate text-lg font-semibold text-navy" title={u.name}>
                  {u.name}
                </h3>
                <p className="truncate text-sm text-muted-foreground" title={u.email}>
                  {u.email}
                </p>

                <p className="mt-3 text-xl font-bold text-primary">
                  {u.coins} <span className="text-sm font-medium text-muted-foreground">E-Coins</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {me && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 shrink-0 text-center font-semibold text-primary">
                #{myRank}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{me.name}</span>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                    You
                  </span>
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  {me.email}
                </div>
              </div>

              <div className="shrink-0 whitespace-nowrap font-semibold">
                {me.coins} ⓔ
              </div>
            </div>
          </div>
        )}

        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="w-10 shrink-0 text-center">Rank</span>
            <span className="flex-1">Participant</span>
            <span className="shrink-0">E-Coins</span>
          </div>

          {leaders.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No entries yet.
            </div>
          )}

          {leaders.map((u, index) => (
            <div
              key={u.user_id}
              className={`flex items-center gap-4 border-b px-4 py-3 last:border-b-0 ${
                u.user_id === user.user_id ? "bg-primary/5" : ""
              }`}
            >
              <span className="w-10 shrink-0 text-center font-semibold text-muted-foreground">
                {(page - 1) * limit + index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{u.name}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {u.email}
                </div>
              </div>
              <div className="shrink-0 whitespace-nowrap font-semibold">
                {u.coins} ⓔ
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-2 text-sm text-muted-foreground">
            Page {page}
          </span>

          <button
            disabled={leaders.length < limit}
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>

      </main>
    </div>
  )
}
