import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/jwt"
import { NextResponse } from "next/server"
import withTransaction from "@/lib/withTransaction"

export async function POST(req) {
  try {
    // ✅ 1. Read token from HTTP-only cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ✅ 2. Verify token safely
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 })
    }

    const senderId = payload.user_id

    // ✅ 3. Get request data
    const { receiverId, amount, password, receiver_name } = await req.json()
    const amt = Number(amount)

    if (!receiverId || !amt || amt <= 0) {
      return NextResponse.json({ error: "Invalid inputs" }, { status: 400 })
    }

    if (receiverId === senderId) {
      return NextResponse.json({ error: "Cannot pay yourself" }, { status: 400 })
    }

    // ✅ 4. Execute atomic transaction
    const result = await withTransaction(async (conn) => {
      // ✅ Lock sender row
      const [users] = await conn.execute(
        "SELECT user_id,email, name, coins, password,pin FROM user WHERE user_id=? FOR UPDATE",
        [senderId]
      )

      if (users.length === 0) throw new Error("User not found")
        const user = users[0]
    if (!user.pin) throw new Error("Set up your PIN before making payments")

      // ✅ Password verification
      const ok = Number(password) === Number(user.pin);
      // console.log("Password check:", ok, password, user.pin);
      if (!ok) throw new Error("Invalid PIN")

      // ✅ Ensure enough coins + atomic safe deduct (prevents double spending)
      const [deductRes] = await conn.execute(
        "UPDATE user SET coins = coins - ? WHERE user_id = ? AND coins >= ?",
        [amt, senderId, amt]
      )
      if (deductRes.affectedRows === 0) throw new Error("Insufficient balance")

      // ✅ Lock receiver row to avoid race conditions if multiple pay-ins occur
      const [stallRows] = await conn.execute(
        "SELECT stall_id FROM food_stall WHERE stall_id=? FOR UPDATE",
        [receiverId]
      )
      if (stallRows.length === 0) throw new Error("Receiver not found")

      // ✅ Add to receiver balance
      await conn.execute(
        "UPDATE food_stall SET coins = coins + ? WHERE stall_id = ?",
        [amt, receiverId]
      )

      // ✅ Log transaction
      const [insertRes] = await conn.execute(
        "INSERT INTO transaction_log (sender_id,sender_name ,sender_email , receiver_id ,receiver_name, amount) VALUES (?, ?, ?, ?, ?, ?)",
        [senderId,user.name,user.email, receiverId,receiver_name, amt]
      )

      return { transaction_id: insertRes.insertId }
    })

    return NextResponse.json({
      message: "Payment successful",
      ...result
    })

  } catch (err) {
    console.error("PAYMENT ERROR:", err)

    // ✅ Return clean safe messages
    if (
      err.message === "Invalid PIN" ||
      err.message === "Insufficient balance" ||
      err.message === "User not found" ||
      err.message === "Receiver not found"
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
  
}
