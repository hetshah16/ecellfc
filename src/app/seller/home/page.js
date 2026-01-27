"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import SellerNavbar from "../../components/SellerNavbar"
import { useRouter } from "next/navigation"

export default function SellerHomePage() {
  const router = useRouter()

  const [items, setItems] = useState([])
  const [seller, setSeller] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ item_name: "", price: 0, stall_id: "" })
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)

  /* ================= FETCH SELLER ================= */
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
        // console.error("Failed to fetch seller:", err)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/seller/login")
        }
      }
    }

    fetchSeller()
  }, [router])

  /* ================= FETCH ITEMS ================= */
  const fetchItems = async () => {
    // setLoading(true)
    if (!seller?.stall_id) return

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

  /* ================= MODAL ================= */
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
    e.preventDefault()
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
        setError(err.response.data?.error || "Failed to create item")
      } else {
        setError("Network error")
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {seller && !loading ?(
        <>
      <SellerNavbar seller={seller?.stall_name}/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Food Items</h1>
          <p className="text-muted-foreground">
            Add new items or view existing ones in your stall
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Add Item Card */}
          <div
            onClick={openModal}
            className={`border border-border rounded-xl bg-card hover:shadow-lg transition flex flex-col items-center justify-center min-h-[160px]
              ${seller ? "cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
          >
            <div className="text-4xl font-bold text-primary">+</div>
            <div className="text-muted-foreground font-medium mt-2">
              Add new item
            </div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No items yet. Click the + button to add one!
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.item_id}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="font-semibold text-foreground mb-1">
                  {item.item_name}
                </div>
                <div className="text-primary font-bold text-lg">
                  ₹{item.price}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-1">Add Food Item</h2>
            <p className="text-muted-foreground mb-4">
              Fill in the details below
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium mb-1">
                Item Name
              </label>
              <input
                className="w-full mb-4 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                name="item_name"
                value={form.item_name}
                onChange={handleChange}
                placeholder="e.g., Veg Sandwich"
              />

              <label className="block text-sm font-medium mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                className="w-full mb-4 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                name="price"
                value={form.price}
                onChange={handleChange}
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
                  className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 font-semibold hover:opacity-90 transition"
                >
                  {submitting ? "Adding..." : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
