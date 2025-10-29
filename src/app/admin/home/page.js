"use client";

import { useState,useEffect } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar"; // client
import AdminDashboard from "../components/AdminDashboard"; // client
import styles from "./page.module.css";
import { use } from "react";
import { useRouter } from "next/navigation";
export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
    useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("/api/admin/me");
        setAdmin(res.data.admin);
        console.log("Fetched admin:", res.data.admin);
      } catch (err) {       
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.");
          router.push("/admin/login");
        } else {
          console.error("Failed to fetch admin:", err);
        }
      }
    };
    fetchAdmin();
  }, []);
  return (
    <div>
      {admin ? (
        <>
      <AdminNavbar />
        <main className={styles.wrap}>
          <h1 className={styles.title}>Admin Console</h1>
          <div className={styles.grid}>
            <AdminDashboard admin={admin}/>
          </div>
        </main>
        </>
       ) : (
      <p>Loading admin...</p>
    )}
  </div>
  );
}
