"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./adminNavbar.module.css";

export default function AdminNavbar() {
  const router = useRouter();

  const logout = async () => {
    // TODO: implement logout API / session destroy
    // For now redirect to login
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>Admin Console</div>

      <nav className={styles.links}>
        <Link className={styles.link} href="/admin/home">Recharge</Link>
        <Link className={styles.link} href="/admin/add-stall">Add stalls</Link>
        <Link className={styles.link} href="/admin/logs">Logs</Link>
        <button className={styles.logout} onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}
