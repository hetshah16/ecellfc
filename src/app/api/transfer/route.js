import { NextResponse } from "next/server"
import withTransaction from "@/lib/withTransaction"
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/jwt"
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
    
    const body = await req.json()
    const { sender_id, password, receiver_id, receiver_name, amount } = body
    const amt = Number(amount)

    const result = await withTransaction(async (conn) => {
      // 🔒 Lock rows
      const [rows] = await conn.execute(
        "SELECT user_id, name, email, password, coins FROM user WHERE user_id IN (?, ?) FOR UPDATE",
        [sender_id, receiver_id]
      )

      const sender = rows.find(r => r.user_id === sender_id)
      const receiver = rows.find(r => r.user_id === receiver_id)
      if (!sender || !receiver) throw new Error("User not found")

      const ok = await bcrypt.compare(password, sender.password)
      if (!ok) throw new Error("Invalid password")

      if (Number(sender.coins) < amt) throw new Error("Insufficient balance")

      await conn.execute("UPDATE user SET coins = coins - ? WHERE user_id = ?", [amt, sender_id])
      await conn.execute("UPDATE user SET coins = coins + ? WHERE user_id = ?", [amt, receiver_id])

      const [insertRes] = await conn.execute(
        "INSERT INTO transfer_log (sender_id, sender_name, receiver_id, receiver_name, amount) VALUES (?, ?, ?, ?, ?)",
        [sender_id, sender.name, receiver_id, receiver.name, amt]
      )

      return { transaction_id: insertRes.insertId }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: err.message || "Transfer failed" }, { status: 400 })
  }
}

