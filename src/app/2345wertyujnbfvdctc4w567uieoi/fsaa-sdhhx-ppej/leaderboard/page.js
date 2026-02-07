"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import LeaderboardChart from "../components/LeaderboardChart"
import AdminNavbar from "../components/AdminNavbar"

export default function LeaderboardPage() {
  const [data, setData] = useState([])
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/leaderboard")
        setData(res.data)
      } catch (err) {
        console.error("Failed to load leaderboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const top3 = data.slice(0, 3)
  const rest = data
  const maxCoins = data[0]?.coins || 1

  const totalSales = data.reduce(
  (sum, stall) => sum + (stall.coins || 0),
  0
)

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

    {/* Total Sales */}
    <div className="mb-10 flex justify-center">
    <div className="bg-card border rounded-2xl p-8 text-center max-w-md w-full">
        <p className="text-sm text-muted-foreground">
        Total Sales (All Stalls)
        </p>

        <h2 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mt-2">
        💰 {totalSales.toLocaleString()} E-Coins
        </h2>
    </div>
    </div>


      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🏆 Stall Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top performing food stalls by E-Coins earned
          </p>
        </div>

        {/* Leaderboard Graph */}
        {/* <div className="mb-10">
             <LeaderboardChart data={data} />
        </div> */}


        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {top3.map((stall, index) => (
            <div
              key={stall.stall_id}
              className={`rounded-2xl p-6 text-center shadow-md border
                ${index === 0 ? "bg-yellow-50 border-yellow-300" :
                index === 1 ? "bg-gray-50 border-gray-300" :
                "bg-orange-50 border-orange-300"}
              `}
            >
              <div className="text-4xl mb-2">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
              </div>
              <h3 className="text-xl font-semibold text-blue-900">{stall.stall_name}</h3>
              <p className="mt-2 text-lg font-bold text-primary">
                💰 {stall.coins} E-Coins
              </p>
            </div>
          ))}
        </div>

        {/* Rest of leaderboard */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-4 border-b text-sm font-medium text-muted-foreground">
            Full Rankings
          </div>

          <div className="divide-y">
            {rest.map((stall, index) => {
              const percentage = (stall.coins / maxCoins) * 100

              return (
                <div
                  key={stall.stall_id}
                  className="p-4 flex items-center gap-4 hover:bg-muted/40 transition"
                >
                  <div className="w-8 text-center font-semibold">
                    #{index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">{stall.stall_name}</div>
                    <div className="w-full h-2 bg-muted rounded-full mt-2">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="font-semibold whitespace-nowrap">
                    💰 {stall.coins}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
