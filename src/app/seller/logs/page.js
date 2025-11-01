"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import SellerNavbar from "@/app/components/SellerNavbar"

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "2rem 1.5rem",
  },
  wrap: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: "0",
  },
  tableContainer: {
    background: "#1e293b",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
    overflow: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(0,0,0,0.2)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  th: {
    padding: "1.25rem",
    textAlign: "left",
    fontWeight: "700",
    color: "#94a3b8",
    fontSize: "0.85rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tbody: {},
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    transition: "background 0.2s",
  },
  trHover: {
    background: "rgba(31,111,235,0.05)",
  },
  td: {
    padding: "1.25rem",
    color: "#e2e8f0",
    fontSize: "0.95rem",
  },
  loading: {
    padding: "3rem",
    textAlign: "center",
    color: "#94a3b8",
  },
  error: {
    background: "rgba(244,63,63,0.1)",
    border: "1px solid rgba(244,63,63,0.3)",
    color: "#fca5a5",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  },
  empty: {
    padding: "3rem",
    textAlign: "center",
    color: "#64748b",
  },
}

export default function SellerLogsPage() {
  const router = useRouter()
  const [seller, setSeller] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me")
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        })
        setSeller(sellerRes.data)
      } catch (err) {
        console.error("Failed to fetch seller:", err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
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
      setLoading(true)
      setError("")
      try {
        const res = await axios.post("/api/seller/logs", {
          stall_id: seller.stall_id,
        })
        setTransactions(res.data.transactions || [])
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
        setError("Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [seller])

  const formatTimestamp = (ts) => {
    if (!ts) return ""
    try {
      return new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    } catch {
      return ts
    }
  }

  return (
    <div style={styles.container}>
      <SellerNavbar />
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Transaction Logs</h1>
          <p style={styles.subtitle}>View all transactions and payments received</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Sender ID</th>
                <th style={styles.th}>Sender Name</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Date & Time</th>
              </tr>
            </thead>
            <tbody style={styles.tbody}>
              {loading ? (
                <tr>
                  <td colSpan="4" style={styles.loading}>
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={styles.empty}>
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transaction_id} style={styles.tr}>
                    <td style={styles.td}>{tx.sender_id}</td>
                    <td style={styles.td}>{tx.sender_name}</td>
                    <td style={{ ...styles.td, color: "#00d9ff", fontWeight: "700" }}>₹{tx.amount}</td>
                    <td style={styles.td}>{formatTimestamp(tx.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
