"use client";

import React, { useEffect, useState } from "react";
// import styles from "../login/page.module.css"; // optional — use your app styles or create one

// Small helper to format timestamp if you want
function formatValue(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [emailFallback, setEmailFallback] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForPin, setPasswordForPin] = useState("");
  const [pin, setPin] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState(null);

  // Try to fetch /api/me first (works when you have JWT sessions)

  // If no session, allow admin/dev to fetch profile by email (fallback)
  const fetchByEmail = async (e) => {
    e?.preventDefault();
    if (!emailFallback) return setFetchError("Enter an email to load profile");
    setLoadingUser(true);
    setFetchError(null);
    try {
      const res = await fetch(/api/user/by-email?email=${encodeURIComponent(emailFallback)});
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data?.error || Failed to load (status ${res.status}));
        setUser(null);
      } else {
        setUser(data.user || null);
      }
    } catch (err) {
      console.error(err);
      setFetchError("Network error");
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // Open modal and reset previous reveal state
  const openRevealModal = () => {
    setPasswordForPin("");
    setRevealError(null);
    setPin(null);
    setShowPasswordModal(true);
  };

  // Call /api/user/reveal-pin to verify password and get pin
  const handleReveal = async (e) => {
    e?.preventDefault();
    if (!user && !emailFallback) return setRevealError("No user loaded");
    if (!passwordForPin) return setRevealError("Enter your account password");

    setRevealError(null);
    setRevealLoading(true);

    try {
      const body = {};
      // Prefer session: backend will use session if available. If not, provide email.
      if (!user?.email && emailFallback) {
        body.email = emailFallback;
      } else {
        body.email = user.email;
      }
      body.password = passwordForPin;

      const res = await fetch("/api/user/reveal-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRevealError(data?.error || Failed (status ${res.status}));
        setPin(null);
      } else {
        setPin(data.pin ?? null);
        setRevealError(null);
      }
    } catch (err) {
      console.error("Reveal error", err);
      setRevealError("Network error");
      setPin(null);
    } finally {
      setRevealLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "2rem auto", padding: 12 }}>
      <h1 style={{ marginBottom: 8 }}>My profile</h1>
      <p style={{ color: "#6b7280" }}>Your basic details. PIN is hidden for security — click Show PIN to verify with your password.</p>

      {loadingUser ? (
        <div style={{ marginTop: 18 }}>Loading profile…</div>
      ) : !user ? (
        <div style={{ marginTop: 18 }}>
          <div style={{ marginBottom: 8 }}>No active session found.</div>
          <form onSubmit={fetchByEmail} style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Enter your email to load profile"
              value={emailFallback}
              onChange={(e) => setEmailFallback(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e6e6", minWidth: 260 }}
            />
            <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none" }}>
              Load
            </button>
          </form>
          {fetchError && <div style={{ marginTop: 8, color: "#b91c1c" }}>{fetchError}</div>}
        </div>
      ) : (
        <div style={{ marginTop: 18, background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 8px 24px rgba(2,6,23,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>User id</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.user_id)}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Name</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.name)}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Email</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.email)}</div>
            </div>

            <div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>PIN</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {pin ? (
                  <span style={{ letterSpacing: 2 }}>{String(pin)}</span>
                ) : (
                  <span>**</span>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={openRevealModal}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}
                >
                  Show PIN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* password modal */}
      {showPasswordModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(6,6,10,0.5)"
        }}>
          <div style={{ width: 420, background: "#fff", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Enter your password</h3>
            <form onSubmit={handleReveal} style={{ display: "grid", gap: 10 }}>
              <input
                type="password"
                placeholder="Account password"
                value={passwordForPin}
                onChange={(e) => setPasswordForPin(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #e6e6e6" }}
              />
              {revealError && <div style={{ color: "#b91c1c" }}>{revealError}</div>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setRevealError(null); setPasswordForPin(""); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={revealLoading}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff" }}
                >
                  {revealLoading ? "Checking…" : "Verify & Show"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}