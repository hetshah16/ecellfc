"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import StallCard from "../components/StallCard";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";


export default function HomePage() {
  const router = useRouter();
  const [stalls, setStalls] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const r = await axios.get("/api/me");
        console.log("Me data:", r.data);
        const res = await axios.post("/api/user",{
          user_id : r.data.user.user_id
        });
        setUser(res.data);
        console.log("Fetched user:", res.data);
      } catch (err) {       
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Session expired or invalid. Please log in again.");
          router.push("/login");
        } else {
          console.error("Failed to fetch user:", err);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    async function getStalls() {
      try {
        const res = await axios.get("/api/stalls");
        setStalls(res.data);
        console.log("Fetched stalls:", res.data);
      } catch (error) {
        console.log("Error fetching stalls:", error);
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
    {user ? (
      <>
        <Navbar />
        <main className={styles.wrap}>
          <section className={styles.headerCard}>
            <div>
              <h2>Welcome back, {user?.name}</h2>
              <p className={styles.muted}>E-coins balance</p>
              <div className={styles.balance}>{user?.coins} ⓔ</div>
            </div>
          </section>
          <section className={styles.list}>
            {stallsWithPhotos.map((stall) => (
              <StallCard stall={stall} key={stall.stall_id} />
            ))}
          </section>
        </main>
      </>
    ) : (
      <p>Loading user...</p>
    )}
  </div>
);
}
