// /app/auth/reset/ResetPasswordClient.jsx
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!token || !email) {
      setMessage("Missing email or token in the URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1400);
      } else {
        setMessage(data?.error || `Error resetting password (status ${res.status})`);
      }
    } catch (err) {
      console.error("Reset submit error:", err);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 14 }}>
      {message && (
        <div style={{ marginBottom: 12, color: message.startsWith("Password reset successful") ? "#065f46" : "#b91c1c" }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8, border: "1px solid #e6e6e6" }}
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 8, border: "1px solid #e6e6e6" }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e6e6e6",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
