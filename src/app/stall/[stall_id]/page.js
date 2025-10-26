// src/app/stall/[stall_id]/page.js
import Navbar from "@/app/components/Navbar"; // client
import pool from "@/lib/db";
import styles from "./page.module.css";
import PaymentForm from "./PaymentForm"; // client component (see below)

export default async function StallPage({ params }) {
  const { stall_id } = params;

  // Fetch stall & menu server-side
  const [stalls] = await pool.execute("SELECT stall_id, stall_name, coins FROM food_stall WHERE stall_id = ?", [stall_id]);
  if (!stalls.length) {
    return <div><Navbar /><main className={styles.wrap}><h2>Stall not found</h2></main></div>;
  }
  const stall = stalls[0];
  const [items] = await pool.execute("SELECT item_id, item_name, price, photo_url FROM food_item WHERE stall_id = ?", [stall_id]);

  return (
    <div>
      <Navbar />
      <main className={styles.wrap}>
        <section className={styles.stallHeader}>
          <div>
            <h1>{stall.stall_name}</h1>
            <p className={styles.meta}>Stall ID: #{stall.stall_id}</p>
          </div>
          <div>
            <div className={styles.coins}>Stall coins: {stall.coins ?? 0} ⓔ</div>
          </div>
        </section>

        <section className={styles.menuGrid}>
          {items.map((it) => (
            <div className={styles.menuCard} key={it.item_id}>
              <img src={it.photo_url || `/placeholders/food-${it.item_id % 10}.jpg`} alt={it.item_name} className={styles.menuImg} />
              <div className={styles.menuBody}>
                <strong>{it.item_name}</strong>
                <div className={styles.price}>{it.price} ⓔ</div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.paySection}>
          <h3>Make Payment</h3>
          <PaymentForm stallId={stall.stall_id} />
        </section>
      </main>
    </div>
  );
}
