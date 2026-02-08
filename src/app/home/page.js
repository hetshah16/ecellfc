"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import StallCard from "../components/StallCard"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [stalls, setStalls] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me")
        const res = await axios.post("/api/user", {
          user_id: r.data.user.user_id,
        })
        // console.log(res.data)
        setUser(res.data)
        
        if (!res.data.pin) {
          alert("Set your pin first");
          router.push("/profile")
        }
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/login")
        } else {
          console.error("Failed to fetch user:", err)
        }
      }
    }
    fetchUser()
  }, [router])

  useEffect(() => {
    async function getStalls() {
      try {
        const res = await axios.get("/api/stalls")
        const stallsWithPhotos = res.data.map((s) => ({
          ...s,
          photo_url: `https://source.unsplash.com/collection/139386/400x300?sig=${s.stall_id}`,
        }))
        setStalls(stallsWithPhotos)
      } catch (error) {
        console.error("Error fetching stalls:", error)
      } finally {
        setLoading(false)
      }
    }
    getStalls()
  }, [])

return (
  <div className="min-h-screen bg-background">
    {user ? (
      <>
        <Navbar coins={user?.coins} user={user?.name} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Stalls Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-3xl font-bold mb-2">Available Stalls</h2>
              <p className="text-muted-foreground">
                Browse and order from our partner food vendors
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block mb-4">
                    <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <p className="text-muted-foreground">Loading stalls...</p>
                </div>
              </div>
            ) : stalls.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No stalls available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {stalls.map((stall) => (
                  <StallCard stall={stall} key={stall.stall_id} />
                ))}
              </div>
            )}
          </div>
        </main>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )}
  </div>
)
}
