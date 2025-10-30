"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css"; // reuse admin styles (adjust path if needed)
import AdminNavbar from "../components/AdminNavbar"; // client

/*
Admin Add Stall page:
- Shows a plus card as first card
- Shows existing stalls as cards
- Clicking plus opens modal to add stall
*/

function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: 12,
      boxShadow: "0 10px 30px rgba(16,24,40,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }}>
      {children}
    </div>
  );
}

export default function AdminAddStallPage() {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ stall_name: "", email: "", password: "", coins: 0 });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchStalls();
  }, []);

  async function fetchStalls() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stalls");
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        console.error("fetchStalls failed", res.status, data);
        setError(data?.error || "Failed to load stalls");
        setStalls([]);
      } else {
        setStalls(Array.isArray(data.rows) ? data.rows : []);
      }
    } catch (err) {
      console.error("fetchStalls error", err);
      setError("Network error");
      setStalls([]);
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    setForm({ stall_name: "", email: "", password: "", coins: 0 });
    setError("");
    setShowModal(true);
    setSuccessMsg("");
  }

  function closeModal() {
    setShowModal(false);
    setError("");
    setSubmitting(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "coins" ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!form.stall_name || !form.email || !form.password) {
      setError("Please fill stall name, email and password");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/stalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) {
        setError(data?.error || `Failed to create stall (status ${res.status})`);
      } else {
        setSuccessMsg("Stall created successfully");
        // refresh list
        await fetchStalls();
        // close modal after a short delay so admin sees success
        setTimeout(() => {
          closeModal();
        }, 700);
      }
    } catch (err) {
      console.error("create stall error", err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
        <AdminNavbar />
        <div className={styles.wrap}>
        <h1 className={styles.title}>Manage Food Stalls</h1>

        <p style={{ color: "#6b7280", marginTop: 6 }}>Add new food stalls or view existing ones.</p>

        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 18
        }}>
            {/* Add card (plus) */}
            <div style={{ cursor: "pointer" }} onClick={openModal}>
            <Card style={{ alignItems: "center", justifyContent: "center", minHeight: 160 }}>
                <div style={{ fontSize: 36, color: "#6366f1", fontWeight: 700 }}>＋</div>
                <div style={{ color: "#6b7280", fontWeight: 700 }}>Add new stall</div>
            </Card>
            </div>

            {/* existing stalls */}
            {loading ? (
            <div>Loading stalls…</div>
            ) : stalls.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", color: "#6b7280" }}>No stalls yet</div>
            ) : stalls.map(s => (
            <Card key={s.stall_id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div>
                    <div style={{ fontWeight: 800 }}>{s.stall_name}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>{s.email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 800, color: "#0ea5a4" }}>{s.coins ?? 0} ⓔ</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>#{s.stall_id}</div>
                </div>
                </div>
                <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
                Created: {new Date(s.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </div>
            </Card>
            ))}
        </div>

        {/* Modal */}
        {showModal && (
            <div style={{
            position: "fixed", inset: 0, zIndex: 1200,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(6,6,10,0.45)"
            }}>
            <div style={{
                width: "min(720px, 96%)",
                background: "#fff",
                borderRadius: 12,
                padding: 18,
                boxShadow: "0 30px 80px rgba(2,6,23,0.35)"
            }}>
                <h2 style={{ margin: 0 }}>Create new food stall</h2>
                <p style={{ marginTop: 6, color: "#6b7280" }}>Fill details below</p>

                <form onSubmit={handleSubmit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
                <label className={styles.label}>
                    Stall name
                    <input name="stall_name" value={form.stall_name} onChange={handleChange} className={styles.input} placeholder="e.g. Food Adda" />
                </label>

                <label className={styles.label}>
                    Email
                    <input name="email" type="email" value={form.email} onChange={handleChange} className={styles.input} placeholder="stall@example.com" />
                </label>

                <label className={styles.label}>
                    Password
                    <input name="password" type="password" value={form.password} onChange={handleChange} className={styles.input} placeholder="set a password" />
                </label>

                <label className={styles.label}>
                    Initial coins (optional)
                    <input name="coins" type="number" min="0" value={form.coins} onChange={handleChange} className={styles.input} />
                </label>

                {error && <div className={styles.error}>{error}</div>}
                {successMsg && <div style={{ color: "#065f46", fontWeight: 700 }}>{successMsg}</div>}

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Creating…" : "Create stall"}
                    </button>
                    <button type="button" className={styles.secondaryBtn} onClick={closeModal} disabled={submitting}>Cancel</button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    </div>
  );
}
