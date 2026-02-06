"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SetPinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingPin, setSettingPin] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await axios.get("/api/me");

        const userRes = await axios.post("/api/user", {
          user_id: meRes.data.user.user_id,
        });

        setUser(userRes.data);

        // If PIN already exists, redirect
        if (userRes.data.pin) {
          router.push("/home");
          return;
        }

        setLoading(false);
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          router.push("/login");
        } else {
          console.error("Failed to fetch user:", err);
          setMessage("Something went wrong");
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [router]);

  const handleSetPin = async (e) => {
    e.preventDefault();
    setMessage("");
    setSettingPin(true);

    // Validate PIN (exactly 4 digits)
    if (!/^\d{4}$/.test(pin)) {
        setSettingPin(false);
      return setMessage("PIN must be exactly 4 digits");
    }

    if (pin !== confirmPin) {
      setSettingPin(false);
      return setMessage("PINs do not match");
    }
    if(pin<1000 || pin>9999) {
        setSettingPin(false);
      return setMessage("PIN must be between 1000 and 9999");
    }
    try {
      await axios.post("/api/setpin", { pin });
      router.push("/home");
    } catch (err) {
      console.error("Error setting PIN:", err);
      setMessage("Failed to set PIN");
      setSettingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-card border rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Set Security PIN</h2>
      <p className="text-muted-foreground mb-6">
        Set a 4-digit PIN to protect your account
      </p>

      <form onSubmit={handleSetPin} className="space-y-4">
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="4-digit PIN"
          className="w-full px-4 py-2.5 bg-input border rounded-lg"
        />

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          placeholder="Confirm PIN"
          className="w-full px-4 py-2.5 bg-input border rounded-lg"
        />

        <button
          type="submit"
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          disabled={settingPin}
        >
          {settingPin ? "Setting PIN..." : "Set PIN"}
        </button>

        {message && (
          <p className="text-center text-sm font-medium mt-3 text-destructive">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
