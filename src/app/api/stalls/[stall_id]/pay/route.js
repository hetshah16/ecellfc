// src/app/api/stalls/[stall_id]/pay/route.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

async function getCurrentUserDemo() {
  // demo: pick first user; REPLACE with real session lookup in production
  const [rows] = await pool.execute("SELECT * FROM user ORDER BY user_id LIMIT 1");
  return rows[0] || null;
}

export async function POST(req, { params }) {
  const stall_id = params.stall_id;
  try {
    const { amount, password } = await req.json();
    const amt = Number(amount || 0);

    if (!amt || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    // get current user (demo)
    const user = await getCurrentUserDemo();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    // verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
    }

    // start transaction: deduct user.coins and add stall.coins
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // re-read user balance FOR UPDATE
      const [urows] = await conn.execute("SELECT coins FROM user WHERE user_id = ? FOR UPDATE", [user.user_id]);
      const userCoins = urows[0]?.coins ?? 0;
      if (userCoins < amt) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
      }

      // lock stall row
      const [srows] = await conn.execute("SELECT coins FROM food_stall WHERE stall_id = ? FOR UPDATE", [stall_id]);
      if (!srows.length) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Stall not found" }), { status: 404 });
      }
      const stallCoins = srows[0].coins ?? 0;

      // update balances
      await conn.execute("UPDATE user SET coins = coins - ? WHERE user_id = ?", [amt, user.user_id]);
      await conn.execute("UPDATE food_stall SET coins = coins + ? WHERE stall_id = ?", [amt, stall_id]);

      // optionally, insert a ledger/transactions record (recommended)
      await conn.execute(
        "INSERT INTO transactions (user_id, stall_id, amount, created_at) VALUES (?, ?, ?, NOW())",
        [user.user_id, stall_id, amt]
      ).catch(() => {}); // ignore if table doesn't exist

      await conn.commit();
      conn.release();

      return new Response(JSON.stringify({ success: true, newUserCoins: userCoins - amt }), { status: 200 });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      console.error("Transaction error:", txErr);
      return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
