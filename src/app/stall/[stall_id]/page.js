// src/app/stall/[stall_id]/page.js
"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar"; // client
import styles from "./page.module.css";
import PaymentForm from "./PaymentForm"; // client component (see below)
import MenuCard from "@/app/components/MenuCard"; // client component
import axios from "axios";
import { useRouter } from "next/navigation";

export default function StallPage({params}) {
  const router = useRouter();
  const { stall_id } = use(params);
  const [stall, setStall] = useState(null);
  const [items, setItems] = useState([]);
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
    async function fetchStall() {
      try {
        const res = await axios.get(`/api/stalls/${stall_id}/fooditems`);
        setItems(res.data.items); 
        setStall(res.data.stall_name);
      } catch (error) {
        console.error("Error fetching stall:", error);
      }
    }
    fetchStall();
  }, [stall_id]);


return (
  <div>
    {user ? (
      <>
        <Navbar />
        <main className={styles.wrap}>
          <section className={styles.stallHeader}>
            <div>
              <h1>{stall}</h1>
              <p className={styles.meta}>Stall ID: #{stall_id}</p>
            </div>
            <div>
              {/* <div className={styles.coins}>Stall coins: {stall.coins ?? 0} ⓔ</div> */}
            </div>
          </section>

          <section className={styles.menuGrid}>
            {items.map((it) => (
              <MenuCard item={it} key={it.item_id} />
            ))}
          </section>

          <section className={styles.paySection}>
            <h3>Make Payment</h3>
            <PaymentForm stallId={stall_id} user={user} />
          </section>
        </main>
      </>
    ) : (
      <p>Loading user...</p>
    )}
  </div>
);
}
