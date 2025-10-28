"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../home/page.module.css";

/*
Client-side dashboard:
- loads users from GET /api/admin/users
- filters locally as you type
- selecting a user shows it on right
- recharge posts to POST /api/admin/recharge
*/

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.error(e);
      });
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        String(u.user_id).includes(s)
    );
  }, [q, users]);

  const handleSelect = (user) => {
    setSelected(user);
    setAmount(""); // reset amount
    setMsg(null);
    setErr(null);
  };

  const handleRecharge = async () => {
    if (!selected) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setErr("Enter a valid amount (> 0)");
      return;
    }

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selected.user_id, amount: amt , mode:"counter"}),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Recharge failed");
      } else {
        setMsg(`Recharged ${amt} ⓔ to ${selected.name}. New balance: ${data.new_balance} ⓔ`);
        // clear selection and amount as requested
        setSelected(null);
        setAmount("");
        // refresh users list to show updated balance
        const [updated] = await Promise.all([fetch("/api/admin/users").then((r) => r.json())]);
        setUsers(Array.isArray(updated) ? updated : users);
      }
    } catch (e) {
      console.error(e);
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminWrap}>
      <div className={styles.left}>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            placeholder="Search by name, email or id..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className={styles.userList}>
          {filtered.length === 0 && <div className={styles.empty}>No users found</div>}
          {filtered.map((u) => (
            <button
              key={u.user_id}
              className={`${styles.userRow} ${selected?.user_id === u.user_id ? styles.selectedRow : ""}`}
              onClick={() => handleSelect(u)}
            >
              <div className={styles.userName}>{u.name}</div>
              <div className={styles.userMeta}>
                <span className={styles.muted}>#{u.user_id}</span> • <span className={styles.muted}>{u.email}</span>
              </div>
              <div className={styles.userCoins}>{u.coins ?? 0} ⓔ</div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.detailCard}>
          <h2 className={styles.detailTitle}>Selected user</h2>

          {!selected ? (
            <div className={styles.noSelect}>No user selected. Click a user on the left.</div>
          ) : (
            <div className={styles.selectedInfo}>
              <div className={styles.selRow}>
                <div className={styles.selLabel}>Name</div>
                <div className={styles.selValue}>{selected.name}</div>
              </div>
              <div className={styles.selRow}>
                <div className={styles.selLabel}>Email</div>
                <div className={styles.selValue}>{selected.email}</div>
              </div>
              <div className={styles.selRow}>
                <div className={styles.selLabel}>Balance</div>
                <div className={styles.selValue}>{selected.coins ?? 0} ⓔ</div>
              </div>
            </div>
          )}

          <div className={styles.rechargeBox}>
            <label className={styles.label}>
              Amount (E-coins)
              <input
                className={styles.input}
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!selected || loading}
                placeholder={selected ? "Enter amount" : "Select a user first"}
              />
            </label>

            <div className={styles.row}>
              <button
                className={styles.primaryBtn}
                onClick={handleRecharge}
                disabled={!selected || loading}
              >
                {loading ? "Recharging…" : "Recharge"}
              </button>

              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setSelected(null);
                  setAmount("");
                  setMsg(null);
                  setErr(null);
                }}
              >
                Clear
              </button>
            </div>

            {err && <div className={styles.error}>{err}</div>}
            {msg && <div className={styles.success}>{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
