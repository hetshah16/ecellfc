import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/jwt"
import { NextResponse } from "next/server"
import withTransaction from "@/lib/withTransaction"

export async function POST(req) {
  try {
    // 1️⃣ Read token from HTTP-only cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // 2️⃣ Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 })
    }

    const senderId = payload.user_id

    // 3️⃣ Get request data (receiver and amount)
    const { receiverId,sender_id,sender_name,sender_email ,amount, password } = await req.json()
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // 4️⃣ Run the payment inside a transaction
    const result = await withTransaction(async (conn) => {
      // Fetch sender
      const [users] = await conn.execute(
        "SELECT user_id, name, coins, password FROM user WHERE user_id=?",
        [senderId]
      )
      if (users.length === 0) throw new Error("User not found")
      const user = users[0]

      // Verify password
      const ok = await bcrypt.compare(password, user.password)
      if (!ok) throw new Error("Invalid password")

      // Check balance
      if (user.coins < amt) throw new Error("Insufficient balance")

      // Deduct from sender
      const [deductRes] = await conn.execute(
        "UPDATE user SET coins = coins - ? WHERE user_id = ? AND coins >= ?",
        [amt, user.user_id, amt]
      );

      if (deductRes.affectedRows === 0) {
        throw new Error("Insufficient balance");
      }

      // Add to receiver (food_stall)
      await conn.execute(
        "UPDATE food_stall SET coins = coins + ? WHERE stall_id = ?",
        [amt, receiverId]
      )
      const [stallRows] = await conn.execute(
        "SELECT stall_name FROM food_stall WHERE stall_id = ?",
        [receiverId]
      )
      if (stallRows.length === 0) throw new Error("Receiver stall not found")
      const receiver_name = stallRows[0].stall_name
      // Log transaction
      const [insertRes] = await conn.execute(
        "INSERT INTO transaction_log (sender_id,sender_name,sender_email, receiver_id,receiver_name, amount) VALUES (?, ?, ? ,?, ?, ?)",
        [user.user_id,sender_name,sender_email, receiverId,receiver_name, amt]
      )

      return { transaction_id: insertRes.insertId }
    })

    return NextResponse.json({ message: "Payment successful", ...result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Payment failed" }, { status: 500 })
  }
}
