"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import StallCard from "../components/StallCard";
import styles from "./page.module.css";

export default function HomePage() {
  const [stalls, setStalls] = useState([]);

  useEffect(() => {
    async function getStalls() {
      try {
        const res = await axios.get("/api/stalls");
        setStalls(res.data);
        console.log("Fetched stalls:", res.data);
      } catch (error) {
        console.error("Error fetching stalls:", error);
      }
    }

    getStalls();
  }, []);

  const stallsWithPhotos = stalls.map((s) => ({
    ...s,
    photo_url: `https://source.unsplash.com/collection/139386/400x300?sig=${s.stall_id}`,
  }));

  return (
    <div>
      <Navbar />
      <main className={styles.wrap}>
        <section className={styles.headerCard}>
          <div>
            <h2>Welcome back, PARTH</h2>
            <p className={styles.muted}>E-coins balance</p>
            <div className={styles.balance}>100 ⓔ</div>
          </div>
        </section>

        <section className={styles.list}>
          {stallsWithPhotos.map((stall) => (
            <StallCard stall={stall} key={stall.stall_id} />
          ))}
        </section>
      </main>
    </div>
  );
}
