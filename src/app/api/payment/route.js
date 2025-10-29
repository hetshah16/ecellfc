import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1️⃣ Read token from HTTP-only cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2️⃣ Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    // Now payload.user_id is the authenticated user
    const senderId = payload.user_id;

    // 3️⃣ Get request data (receiver and amount)
    const { receiverId, amount } = await req.json();

    // 4️⃣ Fetch sender from DB
    const [users] = await pool.query(
      "SELECT user_id, name, coins FROM user WHERE user_id=?",
      [senderId]
    );
    if (users.length === 0)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = users[0];

    // 5️⃣ Check balance
    if (user.coins < amount)
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

    // 6️⃣ Perform transaction
    await pool.query("START TRANSACTION");
    await pool.query("UPDATE user SET coins = coins - ? WHERE user_id = ?", [amount, user.user_id]);
    await pool.query("UPDATE food_stall SET coins = coins + ? WHERE stall_id = ?", [amount, receiverId]);
    await pool.query(
      "INSERT INTO transaction_log (sender_id, receiver_id, amount) VALUES (?, ?, ?)",
      [user.user_id, receiverId, amount]
    );
    await pool.query("COMMIT");

    return NextResponse.json({ message: "Payment successful" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
