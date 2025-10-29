"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import axios from "axios";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email) return "Email is required";
    if (!/^[\w.-]+@([\w-]+\.)+[a-zA-Z]{2,}$/.test(email))return "Enter a valid email";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);
    try {
      setLoading(true);
      // Axios automatically sets Content-Type to application/json when passing an object
      const res = await axios.post("/api/login", { email, password });
      // res.data contains the response JSON
      const data = res.data;
      console.log("Login successful:", data);
      // redirect after successful login
      router.push("/home");
    } catch (err) {
      // Axios wraps errors; the actual response is in err.response
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Invalid login");
      } else {
        console.error(err);
        setError("Failed to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };




  return (
     <div className={styles.pageWrap}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <h1>Food Challenge</h1>
          <p className={styles.subtitle}>Sign in to continue</p>
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

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className={styles.divider}>Or continue with</div>

          <div className="auth-buttons" role="group">
            <button type="button" onClick={() => handleOAuth("google")}>
              Continue with Google
            </button>
            <button type="button" onClick={() => handleOAuth("github")}>
              Continue with GitHub
            </button>
          </div>

          <div className={styles.footerLinks}>
            <button type="button" className={styles.linkBtn} onClick={() => router.push("/signup")}>
              Create account
            </button>
            <button type="button" className={styles.linkBtn} onClick={() => router.push("/forgot")}>
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
