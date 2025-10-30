"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./sellerNavbar.module.css";
import axios from "axios";

export default function SellerNavbar() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");
      alert("You’ve been logged out.");
      router.push("/seller/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>Stall Console</div>

      <nav className={styles.links}>
        <Link className={styles.link} href="/seller/home">Home</Link>
        <Link className={styles.link} href="/seller/logs">Logs</Link>
        <button className={styles.logout} onClick={handleLogout}>Logout</button>
      </nav>
    </header>
  );
}
