// /app/auth/reset/ResetPasswordClient.jsx
"use client";

import React, { useState } from "react";
import PasswordInput from "../../components/PasswordInput";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match");
      return;
    }
    if (!token || !email) {
      setMessageType("error");
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
        setMessageType("success");
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1400);
      } else {
        setMessageType("error");
        setMessage(data?.error || `Error resetting password (status ${res.status})`);
      }
    } catch (err) {
      console.error("Reset submit error:", err);
      setMessageType("error");
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-4 rounded-lg border ${
          messageType === "success" 
            ? "bg-green-500/10 border-green-500/30 text-green-700" 
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            New Password
          </label>
          <PasswordInput
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Confirm Password
          </label>
          <PasswordInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex-1 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground font-medium rounded-full transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
