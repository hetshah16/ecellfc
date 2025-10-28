import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const connection = await pool.getConnection(); // get a dedicated connection for transaction
  try {
    const { user_id, amount, mode } = await req.json();

    if (!user_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // Lock the row for update (to prevent concurrent issues)
    const [user] = await connection.query(
      "SELECT coins FROM user WHERE user_id = ? FOR UPDATE",
      [user_id]
    );
    console.log(user);
    if (user.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the coins
    await connection.query(
      "UPDATE user SET coins = coins + ? WHERE user_id = ?",
      [amount, user_id]
    );
    // Optionally log the recharge in transaction_log
    await connection.query(
      "INSERT INTO recharge_log (receiver_id, method, amount) VALUES (?, ?, ?)",
      [user_id, mode, amount] // sender_id = 0 means admin/system
    );

    await connection.commit();
    return NextResponse.json({ success: true, message: "Recharge successful" });

  } catch (err) {
    console.error("Recharge failed:", err);
    await connection.rollback(); // rollback on error
    return NextResponse.json(
      { error: "Recharge failed, rolled back" },
      { status: 500 }
    );
  } finally {
    connection.release(); // release connection back to pool
  }
}
