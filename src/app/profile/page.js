"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import bcrypt from "bcryptjs";
// import styles from "../login/page.module.css"; // optional — use your app styles or create one

// Small helper to format timestamp if you want
function formatValue(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [emailFallback, setEmailFallback] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setpassword] = useState("");
  const [pin, setPin] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);
  const [revealError, setRevealError] = useState(null);

  // Try to fetch /api/me first (works when you have JWT sessions)
  // If no session, allow admin/dev to fetch profile by email (fallback)
  // const fetchByEmail = async (e) => {
  //   e?.preventDefault();
  //   if (!emailFallback) return setFetchError("Enter an email to load profile");
  //   setLoadingUser(true);
  //   setFetchError(null);
  //   try {
  //     const res = await fetch(/api/user/by-email?email=${encodeURIComponent(emailFallback)});
  //     const data = await res.json();
  //     if (!res.ok) {
  //       setFetchError(data?.error || Failed to load (status ${res.status}));
  //       setUser(null);
  //     } else {
  //       setUser(data.user || null);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setFetchError("Network error");
  //     setUser(null);
  //   } finally {
  //     setLoadingUser(false);
  //   }
  // };

  // Open modal and reset previous reveal state

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const r = await axios.get("/api/me")
      const res = await axios.post("/api/user", {
        user_id: r.data.user.user_id,
      })
      
      setUser(res.data)
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        router.push("/login")
      } else {
        console.error("Failed to fetch user:", err)
      }
    }
  }
  fetchUser()
}, [router])

const handleReveal = async (e) => {
  e?.preventDefault();
  if (!password) return setRevealError("Enter your account password");

  setRevealError(null);
  setRevealLoading(true);

  try {
    const res = await axios.post(
      "/api/user/reveal_pin",
      { password });

    // ✅ Success
    setPin(res.data.pin);
    setShowPasswordModal(false);
    setRevealLoading(false);

  } catch (err) {
    console.error(err);

    if (err.response) {
      setRevealError(err.response.data.error || "Invalid password");
    } else {
      setRevealError("Something went wrong");
    }

    setRevealLoading(false);
  }
};
const openRevealModal = () => {
  setShowPasswordModal(true);
  setpassword("");
  setRevealError(null);
};


  return (
    <div style={{ maxWidth: 820, margin: "2rem auto", padding: 12 }}>
      <h1 style={{ marginBottom: 8 }}>My profile</h1>
      <p style={{ color: "#6b7280" }}>Your basic details. PIN is hidden for security — click Show PIN to verify with your password.</p>

      {user?(
        <div style={{ marginTop: 18, background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 8px 24px rgba(2,6,23,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ color: "#000000ff", fontSize: 13 }}>User id</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.user_id)}</div>
            </div>

            <div>
              <div style={{ color: "#000000ff", fontSize: 13 }}>Name</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.name)}</div>
            </div>

            <div>
              <div style={{ color: "#000000ff", fontSize: 13 }}>Email</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>{formatValue(user.email)}</div>
            </div>

            <div>
              <div style={{ color: "#000000ff", fontSize: 13 }}>PIN</div>
              <div style={{ fontWeight: 700, marginTop: 4 }}>
                {pin ? (
                  <span style={{ letterSpacing: 2 }}>{String(pin)}</span>
                ) : (
                  <span>****</span>
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
                value={password}
                onChange={(e) => setpassword(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #e6e6e6" }}
              />
              {revealError && <div style={{ color: "#b91c1c" }}>{revealError}</div>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setRevealError(null); setpassword(""); }}
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