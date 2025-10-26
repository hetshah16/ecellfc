import Navbar from "../components/Navbar"; // client
import styles from "./page.module.css";
import pool from "@/lib/db";

export default async function HomePage() {
  // server-side fetch: get stalls and demo current user
  const [stalls] = await pool.execute(
    "SELECT stall_id, stall_name FROM food_stall ORDER BY stall_id asc"
  );

  // demo user: fetch first user (replace with proper auth)
  const [users] = await pool.execute("SELECT user_id, name, coins FROM user ORDER BY user_id LIMIT 1");
  const user = users[0] || { user_id: null, name: "Guest", coins: 0 };

  // add photo_url fallback for each stall (use real column if available)
  const stallsWithPhotos = stalls.map((s) => ({
    ...s,
    photo_url:
      // placeholder image (Unsplash) — simple and visually pleasing
      `https://source.unsplash.com/collection/139386/400x300?sig=${s.stall_id}`,
  }));

  return (
    <div>
      <Navbar />
      <main className={styles.wrap}>
        <section className={styles.headerCard}>
          <div>
            <h2>Welcome back, {user.name}</h2>
            <p className={styles.muted}>E-coins balance</p>
            <div className={styles.balance}>{user.coins} ⓔ</div>
          </div>
          {/* <div className={styles.actions}>
            <a className={styles.primary} href="/buy">Buy Food</a>
            <a className={styles.ghost} href="/transfer">Transfer</a>
          </div> */}
        </section>

        <section className={styles.list}>
          {stallsWithPhotos.map((stall) => (
            <a
              href={`/stall/${stall.stall_id}`}
              key={stall.stall_id}
              className={styles.card}
            >
              <div className={styles.thumbWrap}>
                <img src={stall.photo_url} alt={stall.stall_name} className={styles.thumb} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>
                  <strong>{stall.stall_name}</strong>
                  <span className={styles.stallId}>#{stall.stall_id}</span>
                </div>
                <div className={styles.cardMeta}>
                  {/* <span>Coins: {stall.coins ?? 0} ⓔ</span> */}
                </div>
              </div>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}
