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
  const [editItem, setEditItem] = useState(null)
  const [deleteItem, setDeleteItem] = useState(null)

  const [form, setForm] = useState({ item_name: "", price: "", stall_id: "" })
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
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/seller/login")
        }
      }
    }

    fetchSeller()
  }, [router])

  /* ================= FETCH ITEMS ================= */
  const fetchItems = async () => {
    if (!seller?.stall_id) return

    try {
      const res = await axios.get(`/api/stalls/${seller.stall_id}/fooditems`)
      setItems(res.data.items)
      setSuccessMsg("");
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

    setForm({ item_name: "", price: "", stall_id: seller.stall_id })
    setError("")
    setSuccessMsg("")
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditItem(null)
    setDeleteItem(null)
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
      if (editItem) {
        console.log("Editing item:", editItem.item_id, form.price)
        await axios.post("/api/seller/edit-items", {
          stall_id: form.stall_id,
          item_id: editItem.item_id,
          new_price: form.price,
        })
        setSuccessMsg("Item updated successfully!")
      } else {
        await axios.post("/api/seller/add-items", form)
        setSuccessMsg("Food item added successfully!")
      }
      setTimeout(() => closeModal(), 500) 
      await fetchItems()
      
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || "Action failed")
      } else {
        setError("Network error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteConfirm() {
    try {
      await axios.post("/api/seller/delete-items", {
        item_id: deleteItem.item_id,
        stall_id: seller.stall_id,
      })
      setSuccessMsg("Item deleted successfully!")
      await fetchItems()
      setDeleteItem(null)
    } catch {
      setError("Failed to delete item")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {seller && !loading ? (
        <>
          <SellerNavbar seller={seller?.stall_name} />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Manage Food Items</h1>
              <p className="text-muted-foreground">
                Add new items or view existing ones in your stall
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Add Item Card */}
              <div
                onClick={openModal}
                className={`border border-border rounded-xl bg-card hover:shadow-lg transition flex flex-col items-center justify-center min-h-[130px] max-h-[130px]
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
                    className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition min-h-[130px] max-h-[130px] flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        {item.item_name}
                      </div>
                      <div className="text-primary font-bold text-lg">
                        ₹{item.price}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditItem(item)
                          setForm({
                            item_name: item.item_name,
                            price: item.price,
                            stall_id: seller.stall_id,
                          })
                          setShowModal(true)
                        }}
                        className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 font-semibold hover:opacity-90 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => setDeleteItem(item)}
                        className="flex-1 bg-destructive text-destructive-foreground rounded-lg py-2 font-semibold hover:bg-destructive/90 transition"
                        >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>

          {/* ADD / EDIT MODAL (same UI) */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md bg-card border border-border rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-1">
                  {editItem ? "Edit Food Item" : "Add Food Item"}
                </h2>
                <p className="text-muted-foreground mb-4">
                  Fill in the details below
                </p>

                <form onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium mb-1">
                    Item Name
                  </label>
                  <input
                    disabled={!!editItem}
                    className="w-full mb-4 px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary disabled:bg-muted"
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                  />

                  <label className="block text-sm font-medium mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full mb-4 px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary"
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
                      {submitting
                        ? editItem
                          ? "Updating..."
                          : "Adding..."
                        : editItem
                        ? "Update Item"
                        : "Add Item"}
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

          {/* DELETE CONFIRM MODAL (same styling) */}
          {deleteItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold mb-2">Confirm Deletion</h2>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold">
                    {deleteItem.item_name}
                  </span>
                  ?
                </p>
                  {successMsg && (
                    <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                      {successMsg}
                    </div>
                  )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteItem(null)}
                    className="flex-1 border border-border rounded-lg py-2 text-muted-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 font-semibold hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
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
