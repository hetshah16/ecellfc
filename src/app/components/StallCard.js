// components/StallCard.js
import React from 'react';
import styles from './StallCard.module.css';

export default function StallCard({ stall }) {
  return (
    <a
      href={`/stall/${stall.stall_id}`}
      className={styles.card}
      key={stall.stall_id}
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
  );
}
