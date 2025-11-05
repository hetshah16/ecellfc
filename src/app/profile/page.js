"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar"

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [pin, setPin] = useState(null);
  const [pinVisible, setPinVisible] = useState(false); // track if PIN has been revealed

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [newPin, setNewPin] = useState("");
  const [mode, setMode] = useState("reveal"); // "reveal" | "set" | "update"

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me");
        const res = await axios.post("/api/user", {
          user_id: r.data.user.user_id,
        });
        setUser(res.data);
        setPin(res.data.pin || null);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/login");
        } else {
          console.error("Failed to fetch user:", err);
          setFetchError("Unable to fetch user details.");
        }
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!password) return setModalError("Please enter your account password.");

    setModalError(null);
    setModalLoading(true);

    try {
      if (mode === "reveal") {
        const res = await axios.post("/api/user/reveal_pin", { password });
        setPin(res.data.pin);
        setPinVisible(true);
      } else if (mode === "set" || mode === "update") {
        if (!newPin || newPin.length !== 4){
          setModalError("PIN must be exactly 4 digits.");
          return;
        }

        await axios.post("/api/updatepin", {
          user_id: user.user_id,
          password,
          pin: newPin,
        });

        setPin(newPin);
        setPinVisible(true); // show the new PIN immediately
      }

      setShowPasswordModal(false);
      setPassword("");
      setNewPin("");
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.error ||
          (mode === "reveal"
            ? "Invalid password"
            : "Failed to update PIN")
      );
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = (modeType) => {
    setMode(modeType);
    setShowPasswordModal(true);
    setPassword("");
    setNewPin("");
    setModalError(null);
  };

  // Determine which buttons to show based on pin state
  const renderPinSection = () => {
    if (pin === null) {
      // No PIN set yet
      return (
        <>
          
          <div style={{ color: "#000000ff", fontWeight: 700, marginTop: 4 }}>–</div>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => openModal("set")}
              style={buttonStyle}
            >
              Set PIN
            </button>
          </div>
        </>
      );
    } else {
      // PIN exists
      return (
        <>
          <div style={{ color: "#000000ff", fontWeight: 700, marginTop: 4 }}>
            {pinVisible ? (
              <span style={{ letterSpacing: 2 }}>{String(pin)}</span>
            ) : (
              <span>****</span>
            )}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            {!pinVisible && (
              <button
                onClick={() => openModal("reveal")}
                style={buttonStyle}
              >
                Show PIN
              </button>
            )}
            <button
              onClick={() => openModal("update")}
              style={buttonStyle}
            >
              Update PIN
            </button>
          </div>
        </>
      );
    }
  };
  const handleForgot = async () => {
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      alert("A link was sent to your email to reset your PIN.")
    } catch (err) {
      alert("Unable to process request.")
    }
  }
  const buttonStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e6e6e6",
    background: "#fff",
    cursor: "pointer",
    color: "#000000ff"
  };

  return (
    <>
    {user ?(<>
      <Navbar coins={user?.coins} user={user?.name}/>
      <div style={{ maxWidth: 820, margin: "2rem auto", padding: 12 }}>

        <h1 style={{ marginBottom: 8 }}>My Profile</h1>
        <p style={{ color: "#6b7280" }}>
          Manage your account securely. You can set, reveal, or update your 4-digit PIN.
        </p>

        {loadingUser ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block mb-4">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground">Loading user data...</p>
            </div>
          </div>
        ) : fetchError ? (
          <p style={{ color: "#b91c1c" }}>{fetchError}</p>
        ) : (
          user && (
            <div
              style={{
                marginTop: 18,
                background: "#fff",
                padding: 16,
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ color: "#000000ff", fontSize: 13 }}>User ID</div>
                  <div style={{ color: "#000000ff",fontWeight: 700, marginTop: 4 }}>
                    {user.user_id}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#000000ff", fontSize: 13 }}>Name</div>
                  <div style={{ color: "#000000ff",fontWeight: 700, marginTop: 4 }}>
                    {user.name}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#000000ff", fontSize: 13 }}>Email</div>
                  <div style={{ color: "#000000ff", fontWeight: 700, marginTop: 4 }}>
                    {user.email}
                  </div>
                </div>

                <div>
                  <div style={{ color: "#000000ff", fontSize: 13 }}>PIN</div>
                  {renderPinSection()}
                </div>
              </div>
            </div>
          )
        )}

        {/* Password / PIN Modal */}
        {showPasswordModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(6,6,10,0.5)",
            }}
          >
            <div
              style={{
                width: 420,
                background: "#fff",
                borderRadius: 10,
                padding: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ color: "#000000ff", marginTop: 0, marginBottom: 12 }}>
                {mode === "reveal"
                  ? "Verify your password"
                  : mode === "set"
                  ? "Set your PIN"
                  : "Update your PIN"}
              </h3>

              <form onSubmit={handleModalSubmit} style={{ display: "grid", gap: 12 }}>
                <input
                  type="password"
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: 14,
                    color: "#111",
                  }}
                />
                {(mode === "set" || mode === "update") && (
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="Enter new 4-digit PIN"
                    pattern="^[1-9][0-9]{3}$"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={4}
                    minLength={4}
                    onInvalid={(e) => e.target.setCustomValidity("Enter a PIN between 1000 and 9999")}
                    onInput={(e) => e.target.setCustomValidity("")}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: 14,
                      color: "#000000ff"
                    }}
                  />
                  
                )}
                <button
              type="button"
              onClick={handleForgot}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Forgot password?
            </button>

                {modalError && (
                  <div style={{ color: "#b91c1c" }}>{modalError}</div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    style={buttonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: "#6366f1",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {modalLoading
                      ? "Processing…"
                      : mode === "reveal"
                      ? "Verify & Show"
                      : mode === "set"
                      ? "Set PIN"
                      : "Update PIN"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </>
    ):(<div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>)}
    </>
  );
}
