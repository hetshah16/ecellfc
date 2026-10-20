"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import AdminNavbar from "../components/AdminNavbar"

const tabs = [
  { id: "superadmin", label: "Superadmin Log" },
  { id: "transaction", label: "Transaction Log" },
  { id: "transfer", label: "Transfer Log" },
  { id: "recharge", label: "Recharge Log" },
]
const emptyRows = []

const initialControls = Object.fromEntries(
  tabs.map(({ id }) => [
    id,
    {
      search: "",
      filterColumn: "",
      filterValue: "",
      sortColumn: id === "superadmin" ? "created_at" : "timestamp",
      sortDirection: "desc",
    },
  ])
)

function compareValues(a, b) {
  if (a == null) return b == null ? 0 : -1
  if (b == null) return 1

  const aNumber = Number(a)
  const bNumber = Number(b)
  if (String(a).trim() !== "" && String(b).trim() !== "" && Number.isFinite(aNumber) && Number.isFinite(bNumber)) {
    return aNumber - bNumber
  }

  const aDate = Date.parse(a)
  const bDate = Date.parse(b)
  if (Number.isFinite(aDate) && Number.isFinite(bDate)) {
    return aDate - bDate
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
}

function formatTimestamp(value) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

export default function SuperadminLogsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("superadmin")
  const [logsByTab, setLogsByTab] = useState({})
  const [controlsByTab, setControlsByTab] = useState(initialControls)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    setLoading(true)
    setError("")

    async function fetchLogs() {
      try {
        const response = await axios.get(
          `/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/logs?type=${activeTab}`
        )
        if (active) {
          setLogsByTab((current) => ({
            ...current,
            [activeTab]: response.data.rows || [],
          }))
        }
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) {
          router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
        } else if (active) {
          setLogsByTab((current) => ({ ...current, [activeTab]: [] }))
          setError(err.response?.data?.error || "Failed to load logs")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchLogs()
    return () => {
      active = false
    }
  }, [activeTab, router])

  const rows = logsByTab[activeTab] || emptyRows
  const controls = controlsByTab[activeTab]
  const headers = rows.length > 0 ? Object.keys(rows[0]) : []

  const filteredRows = useMemo(() => {
    const search = controls.search.trim().toLowerCase()
    const filterValue = controls.filterValue.trim().toLowerCase()
    let result = rows.filter((row) => {
      const matchesSearch = !search || Object.values(row).some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
      const matchesFilter = !filterValue || !controls.filterColumn ||
        String(row[controls.filterColumn] ?? "").toLowerCase().includes(filterValue)
      return matchesSearch && matchesFilter
    })

    if (controls.sortColumn) {
      result = [...result].sort((a, b) => {
        const comparison = compareValues(a[controls.sortColumn], b[controls.sortColumn])
        return controls.sortDirection === "asc" ? comparison : -comparison
      })
    }
    return result
  }, [controls, rows])

  function updateControl(name, value) {
    setControlsByTab((current) => ({
      ...current,
      [activeTab]: { ...current[activeTab], [name]: value },
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Logs</h1>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-border" role="tablist" aria-label="Log types">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mb-5 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${tabs.find((tab) => tab.id === activeTab)?.label} controls`}>
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Search this log
            <input
              type="search"
              value={controls.search}
              onChange={(event) => updateControl("search", event.target.value)}
              placeholder={`Search ${headers.length ? headers.join(", ") : "all columns"}...`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>

          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Filter column
            <select
              value={controls.filterColumn}
              onChange={(event) => updateControl("filterColumn", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">All columns</option>
              {headers.map((header) => <option key={header} value={header}>{header}</option>)}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Filter value
            <input
              type="search"
              value={controls.filterValue}
              onChange={(event) => updateControl("filterValue", event.target.value)}
              placeholder={controls.filterColumn ? `Filter ${controls.filterColumn}...` : "Choose a filter column"}
              disabled={!controls.filterColumn}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Sort by
              <select
                value={controls.sortColumn}
                onChange={(event) => updateControl("sortColumn", event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Default order</option>
                {headers.map((header) => <option key={header} value={header}>{header}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Direction
              <select
                value={controls.sortDirection}
                onChange={(event) => updateControl("sortDirection", event.target.value)}
                disabled={!controls.sortColumn}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
          </div>
        </section>

        {error && (
          <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16" role="status" aria-live="polite">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No logs found</p>
        ) : filteredRows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No matching logs found</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/60">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="whitespace-nowrap border-b border-border px-4 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={row.transaction_id ?? row.transfer_id ?? row.recharge_id ?? row.reverse_id ?? index}>
                    {headers.map((header) => (
                      <td key={header} className="whitespace-nowrap border-b border-border/60 px-4 py-3 last:border-b-0">
                        {row[header] == null
                          ? ""
                          : header.toLowerCase().includes("timestamp") || header.toLowerCase().endsWith("_at")
                            ? formatTimestamp(row[header])
                            : String(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
