// src/app/stall/[stall_id]/page.js
"use client";
import React, { use, useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar"; // client
import styles from "./page.module.css";
import PaymentForm from "./PaymentForm"; // client component (see below)
import MenuCard from "@/app/components/MenuCard"; // client component
import axios from "axios";

export default function StallPage({params }) {
  const { stall_id } = use(params);
  const [stall, setStall] = useState(null);
  const [items, setItems] = useState([]);
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
          <PaymentForm stallId={stall_id} />
        </section>
      </main>
    </div>
  );
}
