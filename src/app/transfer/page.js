"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import styles from "../admin/home/page.module.css"; // reuse admin styles for consistent look

export default function TransferPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null); // recipient
  const [senderEmail, setSenderEmail] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error(e));
    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      String(u.user_id).includes(s)
    );
  }, [q, users]);

  const handleSelect = (user) => {
    setSelected(user);
    setMsg(null);
    setErr(null);
  };

  const handleSend = async () => {
    setErr(null);
    setMsg(null);
    if (!selected) return setErr("Select a recipient");
    const amt = Number(amount);
    if (!amt || amt <= 0) return setErr("Enter a valid amount");

    if (!senderEmail || !password) return setErr("Enter your email and password");

    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_email: senderEmail,
          password,
          receiver_id: selected.user_id,
          receiver_name: selected.name,
          amount: amt
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Transfer failed");
      } else {
        setMsg(`Transferred ${amt} ⓔ to ${selected.name}. Transaction id: ${data.transaction_id}`);
        // reset UI
        setSelected(null);
        setAmount("");
        setPassword("");
        setSenderEmail("");
        // refresh users list to show updated balances
        const updated = await fetch("/api/admin/users").then(r => r.json());
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
    <div>
        <Navbar />   
        <div className={styles.wrap}>
        <h1 className={styles.title}>Transfer coins to your friends</h1>
        <div className={styles.adminWrap}>
            <div className={styles.left}>
            <div className={styles.searchBox}>
                <input
                className={styles.searchInput}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email or id..."
                />
            </div>

            <div className={styles.userList}>
                {filtered.length === 0 && <div className={styles.empty}>No users found</div>}
                {filtered.map(u => (
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
                <h2 className={styles.detailTitle}>Send E-coins</h2>

                {!selected ? (
                <div className={styles.noSelect}>Select a recipient from the left.</div>
                ) : (
                <div className={styles.selectedInfo}>
                    <div className={styles.selRow}>
                    <div className={styles.selLabel}>To</div>
                    <div className={styles.selValue}>{selected.name} (#{selected.user_id})</div>
                    </div>
                    <div className={styles.selRow}>
                    <div className={styles.selLabel}>Recipient Balance</div>
                    <div className={styles.selValue}>{selected.coins ?? 0} ⓔ</div>
                    </div>
                </div>
                )}

                <div className={styles.rechargeBox}>
                <label className={styles.label}>
                    Your email
                    <input className={styles.input} value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="you@domain.com" />
                </label>

                <label className={styles.label}>
                    Your password
                    <input type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                </label>

                <label className={styles.label}>
                    Amount (E-coins)
                    <input className={styles.input} type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={!selected} placeholder={selected ? "Enter amount" : "Select recipient first"} />
                </label>

                <div className={styles.row}>
                    <button className={styles.primaryBtn} onClick={handleSend} disabled={!selected || loading}>
                    {loading ? "Sending…" : "Send"}
                    </button>

                    <button className={styles.secondaryBtn} onClick={() => {
                    setSelected(null);
                    setAmount("");
                    setPassword("");
                    setSenderEmail("");
                    setMsg(null);
                    setErr(null);
                    }}>
                    Clear
                    </button>
                </div>

                {err && <div className={styles.error}>{err}</div>}
                {msg && <div className={styles.success}>{msg}</div>}
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
  );
}
