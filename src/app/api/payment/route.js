import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { senderEmail, password, receiverId, amount } = await req.json();

    const [users] = await pool.query("SELECT id, password, ecoins FROM customer WHERE email=?", [senderEmail]);
    if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    if (user.ecoins < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });

    await pool.query("START TRANSACTION");
    await pool.query("UPDATE customer SET ecoins = ecoins - ? WHERE id = ?", [amount, user.id]);
    await pool.query("UPDATE food_stall SET ecoins = ecoins + ? WHERE id = ?", [amount, receiverId]);
    await pool.query("INSERT INTO transaction_log (sender_id, receiver_id, amount) VALUES (?, ?, ?)", [user.id, receiverId, amount]);
    await pool.query("COMMIT");

    return NextResponse.json({ message: "Payment successful" });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
