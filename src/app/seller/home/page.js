
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";
import SellerNavbar from "../../components/SellerNavbar";
 // Use your separate Card component
function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 10px 30px rgba(16,24,40,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
} 
export default function SellerHomePage() {
  const [items, setItems] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ item_name: "", price: 0, stall_id: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch seller info
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const r = await axios.get("/api/seller/me");
        const sellerRes = await axios.post("/api/seller/info", {
          stall_id: r.data.user.seller_id,
        });
        setSeller(sellerRes.data);

        // Set stall_id in form for modal
        setForm((prev) => ({
          ...prev,
          stall_id: sellerRes.data.stall_id,
        }));
      } catch (err) {
        console.error("Failed to fetch seller:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.");
          router.push("/seller/login"); 
        }
      }
    };

    fetchSeller();
  }, []);

  // Fetch items for the seller
  const fetchItems = async () => {
    if (!seller?.stall_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/stalls/${seller.stall_id}/fooditems`);
      setItems(res.data.items);
    } catch (err) {
      console.error("Error fetching stall items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refetch items whenever seller changes
  useEffect(() => {
    fetchItems();
  }, [seller]);

  // Open modal
  function openModal() {
    if (!seller?.stall_id) {
      setError("Seller not loaded yet. Please wait...");
      return;
    }
    setForm({ item_name: "", price: 0, stall_id: seller.stall_id });
    setError("");
    setSuccessMsg("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setError("");
    setSubmitting(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.item_name || !form.price || !form.stall_id) {
      setError("Please fill item name, price, and stall ID");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post("/api/seller/add-items", form);
      setSuccessMsg("Food item added successfully");
      await fetchItems();
      setTimeout(() => closeModal(), 700);
    } catch (err) {
      console.error("create item error:", err);
      if (err.response) {
        setError(err.response.data?.error || `Failed to create item (status ${err.response.status})`);
      } else {
        setError("Network error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <SellerNavbar />
      <div className={styles.wrap}>
        <h1 className={styles.title}>Manage Food Items</h1>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Add new food items or view existing ones.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 18,
          }}
        >
          {/* Add card */}
          <div
            style={{ cursor: seller ? "pointer" : "not-allowed" }}
            onClick={openModal}
          >
            <Card
              style={{
                alignItems: "center",
                justifyContent: "center",
                minHeight: 160,
              }}
            >
              <div style={{ fontSize: 36, color: "#6366f1", fontWeight: 700 }}>＋</div>
              <div style={{ color: "#6b7280", fontWeight: 700 }}>Add new food item</div>
            </Card>
          </div>

          {/* Existing items */}
          {loading ? (
            <div>Loading items…</div>
          ) : items.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", color: "#6b7280" }}>No food items yet</div>
          ) : (
            items.map((item) => (
              <Card key={item.item_id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>{item.item_name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#0ea5a4", fontSize: 14 }}>
                      ₹{item.price}
                    </div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{`#${item.item_id}`}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(6,6,10,0.45)",
            }}
          >
            <div
              style={{
                width: "min(720px, 96%)",
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 30px 80px rgba(2,6,23,0.35)",
              }}
            >
              <h2 style={{ margin: 0 }}>Add new food item</h2>
              <p style={{ marginTop: 6, color: "#6b7280" }}>Fill details below</p>

              <form
                onSubmit={handleSubmit}
                style={{ marginTop: 12, display: "grid", gap: 10 }}
              >
                <label className={styles.label}>
                  Item name
                  <input
                    name="item_name"
                    value={form.item_name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Veg Sandwich"
                  />
                </label>

                <label className={styles.label}>
                  Price (₹)
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </label>

                {error && <div className={styles.error}>{error}</div>}
                {successMsg && (
                  <div style={{ color: "#065f46", fontWeight: 700 }}>{successMsg}</div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Adding…" : "Add item"}
                  </button>
                  <button type="button" className={styles.secondaryBtn} onClick={closeModal} disabled={submitting}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
