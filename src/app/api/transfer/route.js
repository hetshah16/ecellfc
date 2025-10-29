// src/app/api/transfer/route.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

/*
Request body:
{
  sender_email: string,
  password: string,
  receiver_id: number,
  amount: number
}
*/
export async function POST(req) {
  try {
    const body = await req.json();
    const { sender_email, password, receiver_id,receiver_name, amount } = body || {};
    const amt = Number(amount);

    if (!sender_email || !password || !receiver_id || !receiver_name || !amt || isNaN(amt) || amt <= 0) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    // Step 1: resolve sender id from email (quick read)
    const [senderRows] = await pool.execute("SELECT user_id FROM user WHERE email = ? LIMIT 1", [sender_email]);
    if (!senderRows.length) {
      return new Response(JSON.stringify({ error: "Sender email not found" }), { status: 404 });
    }
    const senderId = senderRows[0].user_id;
    const receiverId = Number(receiver_id);

    if (senderId === receiverId) {
      return new Response(JSON.stringify({ error: "Cannot transfer to yourself" }), { status: 400 });
    }

    // Acquire dedicated connection for transaction
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock both user rows in a consistent order to avoid deadlocks
      const [idsToLock] =
        await conn.execute(
          "SELECT user_id FROM user WHERE user_id IN (?, ?) ORDER BY user_id ASC",
          [senderId, receiverId]
        );

      // Now fetch the full rows FOR UPDATE (this locks them)
      const [rows] = await conn.execute(
        "SELECT user_id, email, password, coins FROM user WHERE user_id IN (?, ?) FOR UPDATE",
        [senderId, receiverId]
      );

      // rows will contain two rows (if receiver exists). Find sender and receiver
      const senderRow = rows.find(r => r.user_id === senderId);
      const receiverRow = rows.find(r => r.user_id === receiverId);

      if (!senderRow) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Sender not found (race?)" }), { status: 404 });
      }
      if (!receiverRow) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Receiver not found" }), { status: 404 });
      }

      // Verify password
      const passwordOk = await bcrypt.compare(password, senderRow.password);
      if (!passwordOk) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
      }

      const senderCoins = Number(senderRow.coins || 0);
      if (senderCoins < amt) {
        await conn.rollback();
        return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
      }

      // Update balances
      await conn.execute("UPDATE user SET coins = coins - ? WHERE user_id = ?", [amt, senderId]);
      await conn.execute("UPDATE user SET coins = coins + ? WHERE user_id = ?", [amt, receiverId]);

      // Insert into transfer_log inside same transaction
      const [insertRes] = await conn.execute(
        "INSERT INTO transfer_log (sender_id, receiver_id,receiver_name, amount) VALUES (?, ?, ?, ?)",
        [senderId, receiverId,receiver_name, amt]
      );

      await conn.commit();
      conn.release();

      // Optionally fetch new sender balance
      const [freshSender] = await pool.execute("SELECT coins FROM user WHERE user_id = ?", [senderId]);
      const newBalance = freshSender[0]?.coins ?? null;

      return new Response(JSON.stringify({
        ok: true,
        transaction_id: insertRes.insertId,
        new_balance: newBalance
      }), { status: 200 });
    } catch (txErr) {
      try { await conn.rollback(); } catch (e) {}
      try { conn.release(); } catch (e) {}
      console.error("Transfer transaction error:", txErr);
      return new Response(JSON.stringify({ error: "Transfer failed" }), { status: 500 });
    }
  } catch (err) {
    console.error("Transfer route error:", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
