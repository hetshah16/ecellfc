"use client"
import { use, useEffect, useState } from "react"
import Navbar from "@/app/components/Navbar"
import PaymentForm from "./PaymentForm"
import MenuCard from "@/app/components/MenuCard"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function StallPage({ params }) {
  const router = useRouter()
  const { stall_id } = use(params)
  const [stall, setStall] = useState(null)
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
          router.push("/login")
        }
      }
    }
    fetchUser()
  }, [router])

  useEffect(() => {
    async function fetchStall() {
      try {
        const res = await axios.get(`/api/stalls/${stall_id}/fooditems`)
        setItems(res.data.items)
        setStall(res.data.stall_name)
      } catch (error) {
        console.error("Error fetching stall:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStall()
  }, [stall_id])

  return (
    <div className="min-h-screen bg-background">
      <Navbar coins = {user?.coins} user = {user?.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? (
          <>
            {/* Stall Header */}
            <div className="mb-12 bg-linear-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-xl p-8 backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{stall}</h1>
                  <p className="text-muted-foreground">Stall ID: #{stall_id}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="mb-12">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Menu</h2>
                <p className="text-muted-foreground">Browse and order from available items</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="inline-block mb-4">
                      <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground">Loading menu...</p>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                  <p className="text-muted-foreground">No items available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {items.map((item) => (
                    <MenuCard item={item} key={item.item_id} />
                  ))}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-3xl font-bold mb-2">Order Summary</h2>
              <p className="text-muted-foreground mb-8">Complete your payment to place an order</p>
              <PaymentForm stallId={stall_id} user={user} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block mb-4">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
