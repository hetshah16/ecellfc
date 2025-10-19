"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!displayName) return "Please provide a display name";
    if (!email) return "Email is required";
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirm) return "Passwords do not match";
    return "";
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  const v = validate();
  if (v) return setError(v);

  try {
    setLoading(true);

    const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: displayName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error || "Something went wrong");
    router.push("/login");


    router.push("/login");
  } catch (err) {
    console.error(err);
    setError("Unable to create account. Try again later.");
  } finally {
    setLoading(false);
  }
};


  const handleOAuth = (provider) => {
    console.log("OAuth signup:", provider);
  };

  return (
    <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1>Join the Food Challenge</h1>
          <p className={styles.subtitle}>Create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.label}>
            Display name
            <input
              className={styles.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Priya"
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </label>

          <div className={styles.row}>
            <label className={`${styles.label} ${styles.half}`}>
              Password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
              />
            </label>

            <label className={`${styles.label} ${styles.half}`}>
              Confirm
              <input
                className={styles.input}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••"
                autoComplete="new-password"
              />
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className={styles.divider}>Or sign up with</div>

          <div className="auth-buttons" role="group" aria-label="OAuth providers">
            <button type="button" onClick={() => handleOAuth("google")}>
              Continue with Google
            </button>
            <button type="button" onClick={() => handleOAuth("github")}>
              Continue with GitHub
            </button>
          </div>

          <div className={styles.footerLinks}>
            <span>Already have an account?</span>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push("/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
