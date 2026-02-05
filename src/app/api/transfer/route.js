import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/jwt"
import withTransaction from "@/lib/withTransaction"

export async function POST(req) {
  try {
    // ✅ 1. Check auth cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ✅ 2. Verify token
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 })
    }

    // ✅ 3. Get request data
    const { receiver_id, amount, password } = await req.json()
    const amt = Number(amount)
    const sender_id = payload.user_id
    console.log(sender_id)  
    if (!sender_id || !receiver_id || !amt || amt <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    if (sender_id === receiver_id) {
      return NextResponse.json({ error: "Cannot send coins to yourself" }, { status: 400 })
    }

    // ✅ 4. Atomic transaction
    const result = await withTransaction(async (conn) => {
      // Lock both users
      const [rows] = await conn.execute(
        "SELECT user_id,email, name, coins, password,pin FROM user WHERE user_id IN (?, ?) FOR UPDATE",
        [sender_id, receiver_id]
      )

      const sender = rows.find(r => r.user_id === sender_id)
      const receiver = rows.find(r => r.user_id === receiver_id)

      if (!sender) throw new Error("Sender not found")
      if (!receiver) throw new Error("Receiver not found")

      // Password check
       if (!sender.pin) throw new Error("Set up your PIN before making payments")

      // ✅ Password verification
      const ok = Number(password) === Number(sender.pin);
      // console.log("Password check:", ok, password, user.pin);
      if (!ok) throw new Error("Invalid PIN")

      // Sufficient balance? Atomic check + update
      const [updateSender] = await conn.execute(
        "UPDATE user SET coins = coins - ? WHERE user_id = ? AND coins >= ?",
        [amt, sender_id, amt]
      )
      if (updateSender.affectedRows === 0) throw new Error("Insufficient balance")

      // Credit receiver
      await conn.execute(
        "UPDATE user SET coins = coins + ? WHERE user_id = ?",
        [amt, receiver_id]
      )

      // Log transfer
      const [insertRes] = await conn.execute(
        "INSERT INTO transfer_log (sender_id,sender_name,sender_email, receiver_id,receiver_name,receiver_email, amount) VALUES (?, ?, ?, ? , ?, ?, ?)",
        [sender_id,sender.name,sender.email, receiver_id,receiver.name,receiver.email, amt]
      )

      return { transaction_id: insertRes.insertId }
    })

    // ✅ Success
    return NextResponse.json(
      { message: "Transfer successful", ...result },
      { status: 200 }
    )

  } catch (err) {
    console.error("TRANSFER ERROR:", err.message)

    // ✅ Expected errors → 400
    if (
      err.message === "Sender not found" ||
      err.message === "Receiver not found" ||
      err.message === "Invalid PIN" ||
      err.message === "Insufficient balance"
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // ✅ Unknown errors → 500
    return NextResponse.json(
      { error: "Transfer failed. Please try again later." },
      { status: 500 }
    )
  }
}
