"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import AdminNavbar from "../components/AdminNavbar"

export default function BestEaterLeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [admin, setAdmin] = useState(null);
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
    setLoading(false);
  }
};


    fetchBestEaters()
  }, [page])

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
          <h1 className="text-3xl font-bold">🍔 Best Eater Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Users ranked by highest E-Coins spent
          </p>
        </div>

        {/* Top 3 Podium */}
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
                💰 {user.coins} E-Coins
              </p>
            </div>
          ))}
        </div>

        {/* Full Rankings */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-4 border-b text-sm font-medium text-muted-foreground">
            Full Rankings
          </div>

          <div className="divide-y">
            {rest.map((user, index) => {
              const percentage = (user.coins / maxCoins) * 100

              return (
                <div
                  key={user.user_id}
                  className="p-4 flex items-center gap-4 hover:bg-muted/40 transition"
                >
                  <div className="w-8 text-center font-semibold">
                    #{(page - 1) * limit + index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">
                      {user.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        (ID: {user.user_id})
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>

                    <div className="w-full h-2 bg-muted rounded-full mt-2">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="font-semibold whitespace-nowrap">
                    💰 {user.coins}
                  </div>
                </div>
              )
            })}
          </div>
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
    disabled={data.length < limit}
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
