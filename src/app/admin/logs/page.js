"use client";

import { useEffect, useState } from "react";
import styles from "../home/page.module.css"; // reuse admin styles; adjust path if needed
import AdminNavbar from "../components/AdminNavbar"; // client

function formatValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v;
  return String(v);
}

export default function AdminRechargeLogsPage() {
  const [q, setQ] = useState("");
  const [receiverIdFilter, setReceiverIdFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("timestamp:desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [rows, setRows] = useState([]);
  const [methods, setMethods] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => { fetchLogs(); /* eslint-disable-next-line */ }, [page, sort]);

  async function fetchLogs() {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (receiverIdFilter) params.set("receiver_id", receiverIdFilter);
      if (methodFilter) params.set("method", methodFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sort", sort);

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (e) {
        console.error("Non-JSON response:", text);
        setFetchError("Server error (non-json)");
        setRows([]); setTotal(0); setMethods([]); return;
      }

      if (!res.ok) {
        console.error("GET /api/admin/logs failed:", res.status, data);
        setFetchError(data?.error || `Request failed (status ${res.status})`);
        setRows([]); setTotal(0); setMethods([]); return;
      }

      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotal(Number(data.total || 0));
      setMethods(Array.isArray(data.methods) ? data.methods : []);
    } catch (err) {
      console.error("Fetch error", err);
      setFetchError("Network error");
      setRows([]); setTotal(0); setMethods([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => { setPage(1); fetchLogs(); };
  const handleClear = () => { setQ(""); setReceiverIdFilter(""); setMethodFilter(""); setDateFrom(""); setDateTo(""); setPage(1); fetchLogs(); };

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvRows = [headers.join(",")];
    for (const r of rows) {
      const line = headers.map(h => {
        const v = r[h] ?? "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(",");
      csvRows.push(line);
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recharge_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const headers = rows.length ? Object.keys(rows[0]) : ["recharge_id","receiver_id","method","amount","timestamp"];

  function formatTimestampToIST(ts) {
  if (!ts) return "";
  // ensure we handle both Date objects and SQL timestamp strings
  const d = typeof ts === "string" ? new Date(ts) : ts;
  try {
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    // fallback
    return d.toString();
  }
}

  return (
    <div>
        <AdminNavbar />
        <div className={styles.wrap}>
        <h1 className={styles.title}>Recharge Logs</h1>

        {fetchError && <div className={styles.error}><strong>Error:</strong> {fetchError}</div>}

        <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input className={styles.searchInput} placeholder="Search (receiver id or method)" value={q} onChange={(e) => setQ(e.target.value)} />

            <input className={styles.searchInput} placeholder="Receiver id filter" value={receiverIdFilter} onChange={(e) => setReceiverIdFilter(e.target.value)} style={{ width: 160 }} />

            <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">All methods</option>
            {methods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            From <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </label>

            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            To <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </label>

            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            <option value="timestamp:desc">Newest first</option>
            <option value="timestamp:asc">Oldest first</option>
            <option value="amount:desc">Amount high → low</option>
            <option value="amount:asc">Amount low → high</option>
            <option value="recharge_id:desc">ID desc</option>
            <option value="recharge_id:asc">ID asc</option>
            <option value="receiver_id:asc">Receiver id asc</option>
            <option value="receiver_id:desc">Receiver id desc</option>
            </select>

            <button className={styles.primaryBtn} onClick={handleSearch}>Apply</button>
            <button className={styles.secondaryBtn} onClick={handleClear}>Clear</button>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className={styles.secondaryBtn} onClick={exportCSV}>Export CSV</button>
            </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, padding: 12, boxShadow: "0 8px 20px rgba(16,24,40,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                    {headers.map(h => <th key={h} style={{ padding: 8 }}>{h}</th>)}
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                    <td colSpan={Math.max(1, headers.length)} style={{ padding: 16 }}>Loading…</td>
                    </tr>
                ) : rows.length === 0 ? (
                    <tr>
                    <td colSpan={Math.max(1, headers.length)} style={{ padding: 16 }}>No logs found</td>
                    </tr>
                ) : (
                    rows.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #fafafa" }}>
                        {headers.map(h => {
                        // render timestamp specially in IST, else use generic formatter
                        if (h.toLowerCase() === "timestamp") {
                            return (
                            <td key={h} style={{ padding: 8 }}>
                                {formatTimestampToIST(r[h])}
                            </td>
                            );
                        }
                        return (
                            <td key={h} style={{ padding: 8 }}>
                            {formatValue(r[h])}
                            </td>
                        );
                        })}
                    </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
        </div>
    </div>
  );

//   function totalPages() {
//     return Math.max(1, Math.ceil(total / pageSize));
//   }
}
