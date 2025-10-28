// components/MenuCard.js
import React from 'react';
import styles from './MenuCard.module.css';

export default function MenuCard({ item }) {
  return (
    <div className={styles.menuCard} key={item.item_id}>
      <img
        src={item.photo_url || `/placeholders/food-${item.item_id % 10}.jpg`}
        alt={item.item_name}
        className={styles.menuImg}
      />
      <div className={styles.menuBody}>
        <strong>{item.item_name}</strong>
        <div className={styles.price}>{item.price} ⓔ</div>
      </div>
    </div>
  );
}
