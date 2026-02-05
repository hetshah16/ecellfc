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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  cardPlus: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "180px",
  },
  cardItem: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  plusIcon: {
    fontSize: "2.5rem",
    color: "#1f6feb",
    fontWeight: "800",
    marginBottom: "0.5rem",
  },
  plusLabel: {
    color: "#94a3b8",
    fontWeight: "700",
    textAlign: "center",
  },
  stallName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "0.25rem",
  },
  stallEmail: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "1rem",
  },
  stallCoins: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#00d9ff",
    marginBottom: "0.25rem",
  },
  stallId: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  stallDate: {
    fontSize: "0.8rem",
    color: "#64748b",
    marginTop: "0.75rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  modalOverlay: {
    position: "fixed",
    inset: "0",
    zIndex: "1200",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.7)",
    padding: "1.5rem",
  },
  modalContent: {
    width: "100%",
    maxWidth: "500px",
    background: "#1e293b",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem 0",
  },
  modalSubtitle: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    margin: "0 0 1.5rem 0",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: "0.5rem",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "0.875rem 1rem",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "0.95rem",
    marginBottom: "1.2rem",
    outline: "none",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "1.5rem",
  },
  primaryBtn: {
    flex: "1",
    padding: "0.875rem 1rem",
    background: "linear-gradient(135deg, #1f6feb 0%, #00d9ff 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    fontSize: "0.95rem",
  },
  secondaryBtn: {
    flex: "1",
    padding: "0.875rem 1rem",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  error: {
    background: "rgba(244,63,63,0.1)",
    border: "1px solid rgba(244,63,63,0.3)",
    color: "#fca5a5",
    padding: "0.875rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  success: {
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.3)",
    color: "#86efac",
    padding: "0.875rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  loading: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "2rem",
  },
}

export default function AdminAddStallPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [stalls, setStalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ stall_name: "", email: "", password: "", coins: 0 })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
    useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/me")
        setAdmin(res.data.admin)
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.")
          router.push("/2345wertyujnbfvdctc4w567uieoi/fsaa-sdhhx-ppej/login")
        } else {
          console.error("Failed to fetch Super admin:", err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAdmin()
  }, [router])
  useEffect(() => {
    const init = async () => {
      await fetchStalls()
      setInitialLoadComplete(true)
    }
    init()
  }, [])

  async function fetchStalls() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/stalls")
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        setError(data?.error || "Failed to load stalls")
        setStalls([])
      } else {
        setStalls(Array.isArray(data.rows) ? data.rows : [])
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Network error")
      setStalls([])
    } finally {
      setLoading(false)
    }
  }

  function openModal() {
    setForm({ stall_name: "", email: "", password: "", coins: 0 })
    setError("")
    setShowModal(true)
    setSuccessMsg("")
  }

  function closeModal() {
    setShowModal(false)
    setError("")
    setSubmitting(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === "coins" ? Number(value) : value }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError("")
    setSuccessMsg("")
    if (!form.stall_name || !form.email || !form.password) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/superhhhppp/762rfvyiorbvuiefnciedlks64378uiw/stalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        setError(data?.error || `Failed to create stall`)
      } else {
        setSuccessMsg("Stall created successfully!")
        await fetchStalls()
        setTimeout(() => {
          closeModal()
        }, 700)
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  if (!admin || !initialLoadComplete) {
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
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Manage Food Stalls</h1>
          <p style={styles.subtitle}>Create and manage all food stalls on your platform</p>
        </div>

        <div style={styles.grid}>
          {/* Add stall card */}
          <div
            onClick={openModal}
            style={styles.cardPlus}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "0 15px 50px rgba(31,111,235,0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.3)"
            }}
          >
            <div style={styles.plusIcon}>＋</div>
            <div style={styles.plusLabel}>Add new stall</div>
          </div>

          {/* Stalls list */}
          {loading ? (
            <div style={{ gridColumn: "1 / -1", ...styles.loading }}>Loading stalls...</div>
          ) : stalls.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", ...styles.loading }}>
              No stalls yet. Click the + button to create one!
            </div>
          ) : (
            stalls.map((s) => (
              <div key={s.stall_id} style={styles.cardItem}>
                <div style={styles.stallName}>{s.stall_name}</div>
                <div style={styles.stallEmail}>{s.email}</div>
                <div style={styles.stallCoins}>{s.coins ?? 0} ⓔ</div>
                <div style={styles.stallId}>ID: {s.stall_id}</div>
                <div style={styles.stallDate}>Created: {new Date(s.created_at).toLocaleDateString("en-IN")}</div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Create Food Stall</h2>
              <p style={styles.modalSubtitle}>Add a new stall to your platform</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Stall Name</label>
                <input
                  style={styles.input}
                  name="stall_name"
                  value={form.stall_name}
                  onChange={handleChange}
                  placeholder="e.g., Pizza Paradise"
                />

                <label style={styles.label}>Email</label>
                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="stall@example.com"
                />

                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Set a secure password"
                />

                <label style={styles.label}>Initial Coins (Optional)</label>
                <input
                  style={styles.input}
                  name="coins"
                  type="number"
                  min="0"
                  value={form.coins}
                  onChange={handleChange}
                  placeholder="0"
                />

                {error && <div style={styles.error}>{error}</div>}
                {successMsg && <div style={styles.success}>{successMsg}</div>}

                <div style={styles.buttonGroup}>
                  <button
                    type="submit"
                    style={styles.primaryBtn}
                    disabled={submitting}
                    onMouseEnter={(e) => {
                      if (!submitting) e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                    }}
                  >
                    {submitting ? "Creating..." : "Create Stall"}
                  </button>
                  <button type="button" style={styles.secondaryBtn} onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
