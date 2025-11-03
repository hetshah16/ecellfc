"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import AdminNavbar from "../components/AdminNavbar"
import AdminDashboard from "../components/AdminDashboard"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/me")
        console.log("Admin data:", res.data)
          setAdmin(res.data.admin)
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.")
          router.push("/admin/login")
        } else {
          console.error("Failed to fetch admin:", err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {admin ? (
        <>
          <AdminNavbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage users and recharge E-coins</p>
            </div>
            <AdminDashboard admin={admin} />
          </main>
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load admin data</p>
        </div>
      )}
    </div>
  )
}
