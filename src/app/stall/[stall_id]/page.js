"use client"

import React from "react";

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

import Navbar from "@/app/components/Navbar"
import PaymentForm from "./PaymentForm"
import MenuCard from "@/app/components/MenuCard"

export default function StallPage({ params }) {
  const router = useRouter()
  const { stall_id } = React.use(params);

  const [stall, setStall] = useState(null)
  const [items, setItems] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pay, setPay] = useState(false)

  // FETCH USER — UNCHANGED
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

  // FETCH STALL — UNCHANGED
  useEffect(() => {
    const fetchStall = async () => {
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
      {user ? (
        <>
          <Navbar coins={user.coins} user={user.name} />

          <main className="max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-wide">
                {stall}
              </h1>

            </div>

            {/* Payment Section — UNCHANGED */}
            {/* Payment CTA Card */}
            {!pay  && (
              <div className="bg-card border border-border rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-lg font-semibold">Ready to place your order ?</p>
                  
                </div>

                <button
                  onClick={() => setPay(true)}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition whitespace-nowrap"
                >
                  Pay Now
                </button>
              </div>
            )}

            {pay && (
              <div className="bg-card border border-border rounded-lg p-6 mb-10">
                <h2 className="text-2xl font-bold mb-2">Order Payment</h2>
                <p className="text-muted-foreground mb-6">
                  Complete your payment to place an order
                </p>
                <PaymentForm
                  stall={stall}
                  stallId={stall_id}
                  user={user}
                  setPay={setPay}
                  setUser={setUser}
                  />
              </div>
            )}

            {/* Menu */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No items available yet</p>
              </div>
            ) : !pay ? (
              <>
                <p className="text-muted-foreground mt-1 text-center">Menu</p>  
                {/* Printed-menu style list */}
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <MenuCard key={item.item_id} item={item} />
                  ))}
                </div>

                {/* Proceed Button — UNCHANGED */}

              </>
            ) : null}
          </main>
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
