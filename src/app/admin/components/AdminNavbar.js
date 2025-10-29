"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./adminNavbar.module.css";
import axios from "axios";

export default function AdminNavbar() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      alert("You’ve been logged out.");
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>Admin Console</div>

      <nav className={styles.links}>
        <Link className={styles.link} href="/admin/home">Recharge</Link>
        <Link className={styles.link} href="/admin/add-stall">Add stalls</Link>
        <Link className={styles.link} href="/admin/logs">Logs</Link>
        <button className={styles.logout} onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}
