// src/app/stall/[stall_id]/PaymentForm.js
"use client";
import { useState } from "react";
import styles from "./page.module.css";

export default function PaymentForm({ stallId }) {
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState("ready"); // ready | askingPw | sending | done
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startPayment = (e) => {
    e.preventDefault();
    setError("");
    const a = Number(amount);
    if (!a || a <= 0) return setError("Enter a valid amount");
    setPhase("askingPw");
  };

  const confirmPayment = async (e) => {
    e.preventDefault();
    setError("");
    setPhase("sending");
    try {
      const res = await fetch(`/api/stalls/${stallId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment failed");
        setPhase("ready");
        setPassword("");
        return;
      }
      setSuccess("Payment successful — your balance updated.");
      setPhase("done");
    } catch (err) {
      setError("Network error");
      setPhase("ready");
    }
  };

  const handleForgot = async () => {
    const email = prompt("Enter your account email to receive a reset link:");
    if (!email) return;
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      alert("If that email exists, a reset link was sent.");
    } catch (err) {
      alert("Unable to process request.");
    }
  };

  return (
    <div className={styles.payBox}>
      <form onSubmit={startPayment} className={styles.payForm}>
        <label className={styles.label}>Amount (E-coins)
          <input className={styles.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <button className={styles.primaryBtn} type="submit">Make Payment</button>
      </form>

      {phase === "askingPw" && (
        <form onSubmit={confirmPayment} className={styles.confirmBox}>
          <label className={styles.label}>Enter your password to confirm
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <div className={styles.confirmActions}>
            <button className={styles.primaryBtn} type="submit">Confirm</button>
            <button type="button" className={styles.linkBtn} onClick={() => setPhase("ready")}>Cancel</button>
            <button type="button" className={styles.linkBtn} onClick={handleForgot}>Forgot password?</button>
          </div>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </div>
  );
}
