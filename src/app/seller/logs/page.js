"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import SellerNavbar from "@/app/components/SellerNavbar"

export default function SellerLogsPage() {
  const router = useRouter()

  const [seller, setSeller] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [reversePayments, setReversePayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [reverseLoading, setReverseLoading] = useState(true)
  const [error, setError] = useState("")
  const [reverseError, setReverseError] = useState("")
  const [activeTab, setActiveTab] = useState("payments")

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me")
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        })
        setSeller(sellerRes.data)
      } catch (err) {
        if (err.response && [401, 403].includes(err.response.status)) {
          router.push("/seller/login")
        } else {
          setError("Failed to load seller info")
        }
      }
    }
    fetchSeller()
  }, [router])

  useEffect(() => {
    if (!seller?.stall_id) return

    const fetchTransactions = async () => {
      // setLoading(true)
      setError("")
      try {
        const res = await axios.post("/api/seller/logs", {
          stall_id: seller.stall_id,
        })
        setTransactions(res.data.transactions || [])
      } catch (err) {
        setError("Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [seller])

  useEffect(() => {
    if (!seller?.stall_id) return

    const fetchReversePayments = async () => {
      setReverseError("")
      try {
        const res = await axios.get("/api/seller/superadminsellerlog")
        setReversePayments(res.data.transactions || [])
      } catch (err) {
        console.error("Failed to load reverse payments:", err)
        setReverseError("Failed to load reverse payments")
      } finally {
        setReverseLoading(false)
      }
    }

    fetchReversePayments()
  }, [seller])

  const formatTimestamp = (ts) => {
    if (!ts) return ""
    try {
      return new Date(ts).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })
    } catch {
      return ts
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {seller && !loading ?(
        <>
          <SellerNavbar seller={seller?.stall_name} />

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-1">
          <h2 className="text-2xl font-bold mb-1">Payments Logs</h2>
          {/* <p className="text-muted-foreground">
            View all payments received
          </p> */}
        </div>

        <div className="mb-6 flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Payments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reverse")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "reverse"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Reverse payments
          </button>
        </div>

        {activeTab === "payments" ? (
          <>
            {error && (
              <div className="mb-4 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.transaction_id}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl"
                  >
                    {/* Left */}
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {tx.sender_name}
                      </p>

                      <p className="text-xs text-muted-foreground truncate">
                        {tx.sender_email}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        #{tx.transaction_id} • {formatTimestamp(tx.timestamp)}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="font-semibold text-green-500 text-sm sm:text-base whitespace-nowrap">
                      +{tx.amount} ⓔ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {reverseError && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {reverseError}
              </div>
            )}

            {reverseLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
              </div>
            ) : reversePayments.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No reverse payments yet
              </p>
            ) : (
              <div className="space-y-3">
                {reversePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{payment.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {payment.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.id} • {formatTimestamp(payment.timestamp)}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-sm font-semibold text-red-500 sm:text-base">
                      -{Math.abs(payment.amount)} ⓔ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
        </>
      ):(
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
