"use client"

import { useEffect, useState } from "react"
import AdminNavbar from "../components/AdminNavbar"
import { useRouter } from "next/navigation"
import axios from "axios"

/* ---------- Utils ---------- */
function formatIST(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

/* ---------- Styles ---------- */
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
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    margin: 0,
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
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid rgba(148,163,184,0.2)",
    color: "#94a3b8",
  },
  tableContainer: {
    background: "#1e293b",
    borderRadius: "12px",
    overflow: "auto",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  thead: {
    background: "rgba(0,0,0,0.2)",
  },
  th: {
    padding: "1.25rem",
    textAlign: "left",
    fontWeight: "700",
    color: "#94a3b8",
    fontSize: "0.8rem",
    textTransform: "uppercase",
  },
  td: {
    padding: "1.25rem",
    color: "#e2e8f0",
    fontSize: "0.9rem",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    whiteSpace: "nowrap",
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

/* ---------- Page ---------- */
export default function AdminLogsPage() {
  const router = useRouter()

  const [admin, setAdmin] = useState(null)
  const [rows, setRows] = useState([])
  const [methods, setMethods] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [q, setQ] = useState("")
  const [receiverIdFilter, setReceiverIdFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sort, setSort] = useState("timestamp:desc")
  const [page, setPage] = useState(1)
  const pageSize = 20

  /* ---------- Auth ---------- */
  useEffect(() => {
    axios
      .get("/api/admin/me")
      .then((res) => setAdmin(res.data.admin))
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (admin) fetchLogs()
  }, [admin, page, sort])

  function istToUtcISOString(value) {
    // value = "YYYY-MM-DDTHH:mm"
    return new Date(value + ":00+05:30").toISOString()
  }
  /* ---------- Fetch ---------- */
  async function fetchLogs() {
    setLoading(true)
    setFetchError(null)

    try {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (receiverIdFilter) params.set("receiver_id", receiverIdFilter)
      if (methodFilter) params.set("method", methodFilter)
      if (dateFrom) params.set("date_from", istToUtcISOString(dateFrom))
      if (dateTo) params.set("date_to", istToUtcISOString(dateTo))
      params.set("page", page)
      params.set("pageSize", pageSize)
      params.set("sort", sort)

      const res = await fetch(`/api/admin/logs?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setRows(data.rows || [])
      setTotal(data.total || 0)
      setMethods(data.methods || [])
    } catch (e) {
      setFetchError(e.message || "Failed to fetch logs")
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const headers = rows.length
    ? Object.keys(rows[0])
    : ["recharge_id", "receiver_id", "method", "amount", "timestamp"]

  if (loading && !admin) {
    return <div style={styles.loading}>Loading admin panel…</div>
  }

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Recharge Logs</h1>
          <p style={styles.subtitle}>All transactions with precise IST timestamps</p>
        </div>

        {fetchError && <div style={styles.error}>{fetchError}</div>}

        <div style={styles.controlsContainer}>
          <input style={styles.input} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <input style={styles.input} placeholder="Receiver ID" value={receiverIdFilter} onChange={(e) => setReceiverIdFilter(e.target.value)} />

          <select style={styles.select} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All methods</option>
            {methods.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input type="datetime-local" style={styles.input} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="datetime-local" style={styles.input} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />

          <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="timestamp:desc">Newest</option>
            <option value="timestamp:asc">Oldest</option>
            <option value="amount:desc">Amount ↓</option>
            <option value="amount:asc">Amount ↑</option>
          </select>

          <button style={styles.button} onClick={() => { setPage(1); fetchLogs() }}>Search</button>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                {headers.map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={headers.length} style={styles.loading}>No logs found</td></tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td key={h} style={styles.td}>
                        {h === "timestamp" ? formatIST(r[h]) : String(r[h] ?? "")}
                      </td>
                    ))}
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
