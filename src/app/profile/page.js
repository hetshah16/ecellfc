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
  const [emailsent, setemailsent] = useState(false);
  const [emailsending, setemailsending] = useState(false);
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
          
          <div className="text-foreground font-bold mt-1">–</div>
          <div className="mt-3">
            <button
              onClick={() => openModal("set")}
              className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors text-sm font-medium"
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
          <div className="text-foreground font-bold mt-1">
            {pinVisible ? (
              <span className="tracking-wider">{String(pin)}</span>
            ) : (
              <span>••••</span>
            )}
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {!pinVisible && (
              <button
                onClick={() => openModal("reveal")}
                className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors text-sm font-medium"
              >
                Show PIN
              </button>
            )}
            <button
              onClick={() => openModal("update")}
              className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors text-sm font-medium"
            >
              Update PIN
            </button>
          </div>
        </>
      );
    }
  };
  const handleForgot = async () => {
    setemailsending(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      // alert("A link was sent to your email to reset your PIN.")
      setemailsending(false);
      setemailsent(true);
      setTimeout(() => { setemailsent(false); }, 4000);
    } catch (err) {
      alert("Unable to send reset link.")
    }
  }

  return (
    <>
    {user ?(<>
      <Navbar coins={user?.coins} user={user?.name}/>
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account securely. You can set, reveal, or update your 4-digit PIN.
            </p>
          </div>

          {loadingUser ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground">Loading user data...</p>
              </div>
            </div>
          ) : fetchError ? (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
              {fetchError}
            </div>
          ) : (
            user && (
              <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {/* User ID */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <div className="text-lg font-semibold text-foreground mt-2 break-all">
                      {user.user_id}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <div className="text-lg font-semibold text-foreground mt-2">
                      {user.name}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <div className="text-lg font-semibold text-foreground mt-2 break-all">
                      {user.email}
                    </div>
                  </div>

                  {/* PIN */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">PIN</label>
                    {renderPinSection()}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Password / PIN Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-card border border-border rounded-xl p-6 sm:p-8 w-full max-w-md shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">
                  {mode === "reveal"
                    ? "Verify your password"
                    : mode === "set"
                    ? "Set your PIN"
                    : "Update your PIN"}
                </h3>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  {(mode === "set" || mode === "update") && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        New 4-digit PIN
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="Enter new PIN"
                        pattern="^[1-9][0-9]{3}$"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        maxLength={4}
                        minLength={4}
                        onInvalid={(e) => e.target.setCustomValidity("Enter a PIN between 1000 and 9999")}
                        onInput={(e) => e.target.setCustomValidity("")}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  )}

                  {modalError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
                      {modalError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50"
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

                {emailsent ? (
                  <div className="p-3 bg-primary/10 border border-primary/50 rounded-lg text-primary text-sm">
                    A link was sent to your email to reset your PIN.
                  </div>
                ):(
                  emailsending ? (
                    <div className="p-3 bg-primary/10 border border-primary/50 rounded-lg text-primary text-sm">
                      Sending reset link...
                    </div>
                  ) : (
                    <button
                    type="button"
                    onClick={handleForgot}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                    Forgot password?
                  </button>
                  )
                )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      </>
    ):(<div className="flex items-center justify-center min-h-screen">
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
