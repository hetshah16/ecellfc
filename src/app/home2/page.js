"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Navbar from "../components/Navbar"
import StallCard2 from "../components/StallCard2"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [stalls, setStalls] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const foodimages=["https://media.istockphoto.com/id/1257020044/photo/gujarati-khaman-dhokla-or-steamed-gram-flour-puffy-snack-cake.jpg?s=612x612&w=0&k=20&c=Wa7oH_wMGhamozcLox6RuGwasrvsDsrYDjG0OY0BcS4=",
    "https://media.istockphoto.com/id/1221237754/photo/two-halves-of-club-sandwich-on-white.jpg?s=612x612&w=0&k=20&c=jTThChWPJoFPxOdW1F4I-UzDqzS97iIgTm4-JJe-gOQ=",
    "https://media.istockphoto.com/id/1835215850/photo/veg-pizza-serving-italian-dish.jpg?s=612x612&w=0&k=20&c=AGzZPLZEs6fzFgwx_1aWBa0ANrSglg_kqf4TPLpcJrU=",
    "https://media.istockphoto.com/id/1316130017/photo/shrimp-penne-alla-vodka.jpg?s=612x612&w=0&k=20&c=BmTq5sizn1qdkH7VrKSGHIoCoN2neGB7ol51d8Pg7u4=",
    "https://media.istockphoto.com/id/503135405/photo/mix-pastries.jpg?s=612x612&w=0&k=20&c=Wi2pCPuhl-MaPiEGWhdqbHYZqCZRhptIkMVpHfJ7_nI=",
    "https://media.istockphoto.com/id/540519504/photo/fresh-smoothies-in-glass.jpg?s=612x612&w=0&k=20&c=KCjc6ItwKEW_pAF9i46tlND0la2d5QM-nfL9onfflxs=",
    "https://media.istockphoto.com/id/1406389610/photo/black-chickpea-chaat-or-kala-chana-chat.jpg?s=612x612&w=0&k=20&c=VmPVuAgY5qjo7BFYv19Z4VSobAozIpIekDKuc5YMV9U=",
    "https://media.istockphoto.com/id/1144497270/photo/manchurian-hakka-schezwan-noodles-popular-indochinese-food-served-in-a-bowl-selective-focus.jpg?s=612x612&w=0&k=20&c=epbd0_NygOPGwF7HiXSXIPXg7ntsPsIGpl96o-1td9Y="
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me")
        const res = await axios.post("/api/user", {
          user_id: r.data.user.user_id,
        })
        console.log(res.data)
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
          photo_url: foodimages[s.stall_id % (foodimages.length-1)+1] // assign photos in a round-robin way,
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Food Stalls
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Explore stalls, pay with coins, and enjoy fresh food.
            </p>
          </div>

          {/* CATEGORY STRIP (soft, calm) */}
          {/* <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
            {["Popular", "Pizza", "Street Food", "Desserts", "Drinks"].map(
              (c) => (
                <span
                  key={c}
                  className="shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  bg-card border border-border text-muted-foreground
                  hover:text-foreground hover:border-primary/40 transition"
                >
                  {c}
                </span>
              )
            )}
          </div> */}

          {/* STALL AREA */}
          <div className="rounded-2xl bg-card border border-border p-5 sm:p-6">

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <div className="w-14 h-14 border-4 border-border border-t-primary rounded-full animate-spin mb-4 mx-auto" />
                  <p className="text-muted-foreground">
                    Loading stalls…
                  </p>
                </div>
              </div>
            ) : stalls.length === 0 ? (
              <div className="text-center py-24 rounded-xl bg-background border border-border">
                <p className="text-muted-foreground">
                  No stalls available right now
                </p>
              </div>
            ) : (
              <>
                {/* subtle divider */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {stalls.length} stalls available
                  </p>
                  <div className="h-px flex-1 ml-4 bg-border" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {stalls.map((stall) => (
                    <StallCard2 stall={stall} key={stall.stall_id} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </>
    ) : (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-border border-t-primary rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-muted-foreground">
            Loading your account…
          </p>
        </div>
      </div>
    )}
  </div>
)


}
