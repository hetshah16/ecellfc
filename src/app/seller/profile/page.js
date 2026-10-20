"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import SellerNavbar from "../../components/SellerNavbar"
import PasswordInput from "../../components/PasswordInput"

export default function SellerProfilePage() {
  const router = useRouter()

  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)

  /* ================= FETCH SELLER (COPIED FROM HOME) ================= */
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
      } finally {
        setLoading(false)
      }
    }

    fetchSeller()
  }, [router])


  
  /* ================= UPDATE PASSWORD ================= */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      await axios.post("/api/seller/update-password", {
        stall_id: seller.stall_id,
        currentPassword,
        newPassword,
      })

      setSuccessMsg("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setTimeout(() => setShowModal(false), 600)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password")
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {seller ? (
        <>
        <SellerNavbar seller={seller.stall_name} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* PROFILE HEADER */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {seller.stall_name?.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1">
                <h1 className="text-2xl font-bold">{seller.stall_name}</h1>
                {/* <p className="text-muted-foreground">{seller.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                Stall ID: <span className="font-medium">{seller.stall_id}</span>
                </p> */}
            </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ACCOUNT DETAILS */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Account Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="text-sm text-muted-foreground">Stall Name</div>
                    <div className="font-medium">{seller.stall_name}</div>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{seller.email}</div>
                </div>

                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="text-sm text-muted-foreground">Stall ID</div>
                    <div className="font-medium">{seller.stall_id}</div>
                </div>
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
                <div>
                <h2 className="text-xl font-semibold mb-2">Security</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Keep your account secure by updating your password regularly.
                </p>

                <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="text-sm text-muted-foreground">Password</div>
                    <div className="font-semibold tracking-widest">••••••••</div>
                </div>
                </div>

                <button
                onClick={() => setShowModal(true)}
                className="mt-6 bg-primary text-primary-foreground rounded-full py-2 font-semibold hover:opacity-90 transition"
                >
                Update Password
                </button>
            </div>
            </div>
        </main>
            {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-1">Update Password</h2>
                <p className="text-muted-foreground mb-4">
                    Enter your current password to continue
                </p>

                <form onSubmit={handlePasswordUpdate}>
                    <label className="block text-sm font-medium mb-1">
                    Current Password
                    </label>
                    <PasswordInput
                    className="w-full mb-4 px-4 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    <label className="block text-sm font-medium mb-1">
                    New Password
                    </label>
                    <PasswordInput
                    className="w-full mb-4 px-4 py-2 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    />

                    {error && (
                    <div className="mb-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                    )}

                    {successMsg && (
                    <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                        {successMsg}
                    </div>
                    )}

                    <div className="flex gap-3 mt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-primary text-primary-foreground rounded-full py-2 font-semibold hover:opacity-90 transition"
                    >
                        {submitting ? "Updating..." : "Update Password"}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        disabled={submitting}
                        className="flex-1 border border-border rounded-lg py-2 text-muted-foreground hover:bg-muted transition"
                    >
                        Cancel
                    </button>
                    </div>
                </form>
                </div>
            </div>
            )}
        </>

      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}
