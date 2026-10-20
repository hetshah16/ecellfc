"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import AdminNavbar from "../components/AdminNavbar"

export default function BestEaterLeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [admin, setAdmin] = useState(null);
  const pageChangeRef = useRef(false)
const limit = 10;
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

  useEffect(() => {
    const fetchBestEaters = async () => {
  setLoading(true);

  try {
    const res = await axios.get(
      `/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/best-eater?page=${page}&limit=${limit}`
    );

    setData(res.data);
  } catch (err) {
    console.error("Failed to load best eaters", err);
  } finally {
  pageChangeRef.current = false
  setLoading(false);
  }
};


    fetchBestEaters()
  }, [page])

  const changePage = (nextPage) => {
    if (loading || pageChangeRef.current) return
    pageChangeRef.current = true
    setLoading(true)
    setPage(nextPage)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading best eaters...</p>
        </div>
      </div>
    )
  }

  const top3 = data.slice(0, 3)
  const rest = data
  const maxCoins = data[0]?.coins || 1

  const totalSpent = data.reduce(
    (sum, user) => sum + (user.coins || 0),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      {/* Total Spent */}
      {/* <div className="mb-10 flex justify-center">
        <div className="bg-card border rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-sm text-muted-foreground">
            Total Coins Spent (All Users)
          </p>

          <h2 className="text-4xl font-bold text-green-700 dark:text-green-200 mt-2">
            🍽️ {totalSpent.toLocaleString()} E-Coins
          </h2>
        </div>
      </div> */}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Best Eater Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Users ranked by highest E-Coins spent
          </p>
        </div>

        {/* Top 3 Podium */}
        {page === 1 && top3.length > 0 && (
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

        {/* Full Rankings */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="w-10 shrink-0 text-center">Rank</span>
            <span className="flex-1">Participant</span>
            <span className="shrink-0">E-Coins</span>
          </div>

          {rest.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No entries yet.
            </div>
          )}

          <div className="divide-y">
            {rest.map((user, index) => {
              const percentage = (user.coins / maxCoins) * 100

              return (
                <div
                  key={user.user_id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="w-10 shrink-0 text-center font-semibold text-muted-foreground">
                    {(page - 1) * limit + index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        ID: {user.user_id}
                      </span>
                    </div>

                    <div className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </div>

                    <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 whitespace-nowrap font-semibold">
                    {user.coins} ⓔ
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            disabled={loading || page === 1}
            onClick={() => changePage(page - 1)}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-2 text-sm text-muted-foreground">
            Page {page}
          </span>

          <button
            disabled={loading || data.length < limit}
            onClick={() => changePage(page + 1)}
            className="rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>

      </main>
    </div>
  )
}
