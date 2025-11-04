"use client"

import { useEffect, useState } from "react"
import AdminNavbar from "../components/AdminNavbar"
import { useRouter } from "next/navigation"
import axios from "axios"

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "2rem 1.5rem",
  },
  wrap: {
    maxWidth: "1400px",
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
  controlsContainer: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  input: {
    padding: "0.75rem 1rem",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
  },
  select: {
    padding: "0.75rem 1rem",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "0.9rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #1f6feb 0%, #00d9ff 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "0.9rem",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#94a3b8",
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
  td: {
    padding: "1.25rem",
    color: "#e2e8f0",
    fontSize: "0.95rem",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
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
}

export default function AdminLogsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [q, setQ] = useState("")
  const [receiverIdFilter, setReceiverIdFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sort, setSort] = useState("timestamp:desc")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  const [rows, setRows] = useState([])
  const [methods, setMethods] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
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

  useEffect(() => {
    fetchLogs()
  }, [page, sort])

  async function fetchLogs() {
    setLoading(true)
    setFetchError(null)
    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (receiverIdFilter) params.set("receiver_id", receiverIdFilter)
      if (methodFilter) params.set("method", methodFilter)
      if (dateFrom) params.set("date_from", dateFrom)
      if (dateTo) params.set("date_to", dateTo)
      params.set("page", String(page))
      params.set("pageSize", String(pageSize))
      params.set("sort", sort)

      const res = await fetch(`/api/admin/logs?${params.toString()}`)
      const text = await res.text()
      let data
      try {
        data = text ? JSON.parse(text) : null
      } catch (e) {
        console.error("Parse error:", text)
        setFetchError("Server error (non-json)")
        setRows([])
        setTotal(0)
        setMethods([])
        return
      }

      if (!res.ok) {
        setFetchError(data?.error || `Request failed`)
        setRows([])
        setTotal(0)
        setMethods([])
        return
      }

      setRows(Array.isArray(data.rows) ? data.rows : [])
      setTotal(Number(data.total || 0))
      setMethods(Array.isArray(data.methods) ? data.methods : [])
    } catch (err) {
      console.error("Fetch error", err)
      setFetchError("Network error")
      setRows([])
      setTotal(0)
      setMethods([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchLogs()
  }

  const handleClear = () => {
    setQ("")
    setReceiverIdFilter("")
    setMethodFilter("")
    setDateFrom("")
    setDateTo("")
    setPage(1)
    fetchLogs()
  }

  const exportCSV = () => {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csvRows = [headers.join(",")]
    for (const r of rows) {
      const line = headers
        .map((h) => {
          const v = r[h] ?? ""
          const s = String(v).replace(/"/g, '""')
          return `"${s}"`
        })
        .join(",")
      csvRows.push(line)
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recharge_logs_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const headers = rows.length ? Object.keys(rows[0]) : ["recharge_id", "receiver_id", "receiver_name", "receiver_email  ", "method", "amount", "timestamp"]
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
  const formatTimestamp = (ts) => {
    if (!ts) return ""
    try {
      return new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    } catch {
      return ts
    }
  }
  return (
    <div className="min-h-screen bg-background">
    {admin ? (
      <>
      <AdminNavbar />
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Recharge Logs</h1>
          <p style={styles.subtitle}>View and manage all recharge transactions</p>
        </div>

        {fetchError && <div style={styles.error}>{fetchError}</div>}

        <div style={styles.controlsContainer}>
          <input
            type="text"
            style={styles.input}
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <input
            type="text"
            style={styles.input}
            placeholder="Receiver ID"
            value={receiverIdFilter}
            onChange={(e) => setReceiverIdFilter(e.target.value)}
          />
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} style={styles.select}>
            <option value="">All methods</option>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input type="date" style={styles.input} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" style={styles.input} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.select}>
            <option value="timestamp:desc">Newest first</option>
            <option value="timestamp:asc">Oldest first</option>
            <option value="amount:desc">Amount: High to Low</option>
            <option value="amount:asc">Amount: Low to High</option>
          </select>
          <button style={styles.button} onClick={handleSearch}>
            Search
          </button>
          <button style={{ ...styles.button, ...styles.secondaryBtn }} onClick={handleClear}>
            Clear
          </button>
          <button style={{ ...styles.button, ...styles.secondaryBtn, marginLeft: "auto" }} onClick={exportCSV}>
            Export CSV
          </button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                {headers.map((h) => (
                  <th key={h} style={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={headers.length} style={styles.loading}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} style={styles.loading}>
                    No logs found
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx}>
                    {headers.map((h) => (
                      <td key={h} style={styles.td}>
                        {String(r[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Failed to load admin data</p>
        </div>
      )}
    </div>
  )
}
