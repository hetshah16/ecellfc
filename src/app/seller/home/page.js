"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import SellerNavbar from "../../components/SellerNavbar"
import { useRouter } from "next/navigation"

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
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  card: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "160px",
  },
  cardPlus: {
    fontSize: "2.5rem",
    color: "#1f6feb",
    fontWeight: "800",
  },
  cardLabel: {
    color: "#94a3b8",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "0.95rem",
  },
  itemCard: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  itemName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "0.5rem",
  },
  itemPrice: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#00d9ff",
  },
  itemId: {
    fontSize: "0.8rem",
    color: "#64748b",
    marginTop: "0.5rem",
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
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#1f6feb",
    boxShadow: "0 0 0 3px rgba(31,111,235,0.1)",
    background: "rgba(15,23,42,0.8)",
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
    transition: "all 0.2s",
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

export default function SellerHomePage() {
  const router = useRouter()
  const [items, setItems] = useState([])
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ item_name: "", price: 0, stall_id: "" })
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me")
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        })
        setSeller(sellerRes.data)
        setForm((prev) => ({
          ...prev,
          stall_id: sellerRes.data.stall_id,
        }))
      } catch (err) {
        console.error("Failed to fetch seller:", err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/seller/login")
        }
      }
    }
    fetchSeller()
  }, [router])

  const fetchItems = async () => {
    if (!seller?.stall_id) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/stalls/${seller.stall_id}/fooditems`)
      setItems(res.data.items)
    } catch (err) {
      console.error("Error fetching items:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [seller])

  function openModal() {
    if (!seller?.stall_id) {
      setError("Seller not loaded yet. Please wait...")
      return
      
    }
    setForm({ item_name: "", price: 0, stall_id: seller.stall_id })
    setError("")
    setSuccessMsg("")
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setError("")
    setSubmitting(false)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }))
  }

  async function handleSubmit(e) {
    e?.preventDefault()
    setError("")
    setSuccessMsg("")

    if (!form.item_name || !form.price || !form.stall_id) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      await axios.post("/api/seller/add-items", form)
      setSuccessMsg("Food item added successfully!")
      await fetchItems()
      setTimeout(() => closeModal(), 700)
    } catch (err) {
      console.error("Error:", err)
      if (err.response) {
        setError(err.response.data?.error || `Failed to create item`)
      } else {
        setError("Network error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div  className="min-h-screen bg-background">
      <SellerNavbar />
      <div style={styles.wrap}>
        <div style={styles.header}>
          <h1 style={styles.title}>Manage Food Items</h1>
          <p style={styles.subtitle}>Add new items or view existing ones in your stall</p>
        </div>

        <div style={styles.grid}>
          {/* Add card */}
          <div
            onClick={openModal}
            style={{
              ...styles.card,
              ...(seller ? { cursor: "pointer" } : { opacity: 0.6, cursor: "not-allowed" }),
            }}
            onMouseEnter={(e) => {
              if (seller) e.currentTarget.style.transform = "translateY(-4px)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
            }}
          >
            <div style={styles.cardPlus}>＋</div>
            <div style={styles.cardLabel}>Add new item</div>
          </div>

          {/* Items */}
          {loading ? (
            <div style={styles.loading}>Loading items...</div>
          ) : items.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", ...styles.loading }}>No items yet. Click the + button to add one!</div>
          ) : (
            items.map((item) => (
              <div key={item.item_id} style={styles.itemCard}>
                <div style={styles.itemName}>{item.item_name}</div>
                <div style={styles.itemPrice}>₹{item.price}</div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>Add Food Item</h2>
              <p style={styles.modalSubtitle}>Fill in the details below</p>

              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Item Name</label>
                <input
                  style={styles.input}
                  name="item_name"
                  value={form.item_name}
                  onChange={handleChange}
                  placeholder="e.g., Veg Sandwich"
                />

                <label style={styles.label}>Price (₹)</label>
                <input
                  style={styles.input}
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
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
                    {submitting ? "Adding..." : "Add Item"}
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
    </div>
  )
}
