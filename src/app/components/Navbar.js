"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./navbar.module.css";

export default function Navbar() {
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
            <span className={styles.brandText}>E-Cell Food</span>
          </Link>
        </div>

        <div className={`${styles.links} ${open ? styles.open : ""}`}>
          <Link href="/home" className={`${styles.link} ${isActive("/home")}`}>
            Buy Food
          </Link>
          <Link href="/transfer" className={`${styles.link} ${isActive("/transfer")}`}>
            Transfer E-coins
          </Link>
        </div>

        <div className={styles.right}>
          <button
            className={styles.primaryBtn}
            onClick={() => (window.location.href = "/login")}
            aria-label="Sign in"
          >
            Sign in
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
        <Link href="/signup" className={styles.mobileLinkPrimary}>Create account</Link>
      </div>
    </header>
  );
}
