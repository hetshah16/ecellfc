"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./navbar.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await axios.post("/api/logout");        
      alert("You’ve been logged out.");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // close mobile menu on navigation
    setOpen(false);
  }, [pathname]);

  const isActive = (path) => (pathname === path ? styles.active : "");

  return (
    <header className={styles.sticky}>
      <nav className={styles.nav}>
        <div className={styles.brandWrap}>
          <Link href="/home" className={styles.brand}>
            <span className={styles.logoMark}>🍽️</span>
            <span className={styles.brandText}>E-Cell Food Challenge</span>
          </Link>
        </div>

        <div className={`${styles.links} ${open ? styles.open : ""}`}>
          <Link href="/home" className={`${styles.link} ${isActive("/home")}`}>
            Home
          </Link>
          <Link href="/transfer" className={`${styles.link} ${isActive("/transfer")}`}>
            Transfer E-coins
          </Link>
        </div>

        <div className={styles.right}>
          <button className={styles.primaryBtn} onClick={handleLogout}>
            Logout
          </button>

          <button
            className={styles.hamburger}
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile dropdown (animated) */}
      <div className={`${styles.mobileMenu} ${open ? styles.show : ""}`} role="menu" aria-hidden={!open}>
        <Link href="/home" className={styles.mobileLink}>Buy Food</Link>
        <Link href="/transfer" className={styles.mobileLink}>Transfer E-coins</Link>
        <Link href="/" className={styles.mobileLinkPrimary}>Log Out</Link>
      </div>
    </header>
  );
}
