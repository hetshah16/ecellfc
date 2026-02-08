"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import LeaderboardChart from "../../components/LeaderboardChart"
import SellerNavbar from "../../components/SellerNavbar"

export default function LeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState(null)
  const [pageStatus, setPageStatus] = useState(null)
  const router = useRouter()

  // 🔐 Fetch seller info
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me")
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        })

        setSeller(sellerRes.data)
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/seller/login")
        }
      }
    }
    fetchSeller()
  }, [router])

  // 📄 Check if page is live
  useEffect(() => {
    const checkPage = async () => {
      try {
        const page = await axios.get("/api/page-live?key=stall_leaderboard")
        setPageStatus(page.data)
      } catch (err) {
        console.error(err)
      }
    }
    checkPage()
  }, [])

  // 🏆 Fetch leaderboard data only if page is live
  useEffect(() => {
    if (!pageStatus?.is_live) {
      setLoading(false)
      return
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const res = await axios.get("/api/seller/leaderboard")
        setData(res.data)
      } catch (err) {
        console.error("Failed to load leaderboard", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [pageStatus])

  // ⏳ Loading state
  if (loading || !pageStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  // 🚫 Page down state
  if (!pageStatus.is_live) {
    return (
      <div className="min-h-screen bg-background">
        <SellerNavbar seller={seller?.stall_name} />

        <div className="flex items-center justify-center py-32">
          <div className="bg-card border rounded-2xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-2">🏆 Stall Leaderboard</h2>
            <p className="text-muted-foreground">
              {pageStatus.down_message || "This leaderboard will be live soon"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Page live
  const top3 = data.slice(0, 3)
  const rest = data
  const maxCoins = data[0]?.coins || 1
  const totalSales = data.reduce((sum, stall) => sum + (stall.coins || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <SellerNavbar seller={seller?.stall_name} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🏆 Stall Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top performing food stalls by E-Coins earned
          </p>
        </div>

        {/* Leaderboard Graph (optional) */}
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
                "bg-orange-50 border-orange-300"}`}
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
                  <div className="w-8 text-center font-semibold">#{index + 1}</div>

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
