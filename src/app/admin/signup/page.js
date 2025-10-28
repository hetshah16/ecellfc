"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../signup/page.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {

    if (!email) return "Email is required";
    if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email)) return "Enter a valid email";
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

    const res = await fetch("/api/admin/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.error || "Something went wrong");
    router.push("/admin/login");


    router.push("/admin/login");
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

          

          <div className={styles.footerLinks}>
            <span>Already have an account?</span>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push("/admin/login")}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
