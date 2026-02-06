import { verifyToken3 } from "@/lib/jwt"
import { NextResponse } from "next/server"
import withTransaction from "@/lib/withTransaction"

export async function POST(req) {
  try {
    // ✅ 1. Auth check (superadmin only)
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let payload
    try {
      payload = verifyToken3(token)
    } catch {
      return NextResponse.json(
        { error: "Invalid session. Please log in again." },
        { status: 401 }
      )
    }

    // if (payload.role !== "superadmin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    // ✅ 2. Read frontend data (IDs only)
    const { stall_id, user_id, amount,reason } = await req.json()

    const amt = Number(amount)

    if (
      !stall_id ||
      !user_id ||
      !reason ||
      !Number.isInteger(amt) ||
      amt <= 0
    ) {
      return NextResponse.json({ error: "Invalid inputs" }, { status: 400 })
    }

    // ✅ 3. Atomic transaction
    const result = await withTransaction(async (conn) => {
      // 🔒 Lock stall row
      const [stallRows] = await conn.execute(
        `SELECT stall_id, stall_name, email, coins
         FROM food_stall
         WHERE stall_id=? FOR UPDATE`,
        [stall_id]
      )

      if (stallRows.length === 0) throw new Error("Stall not found")

      const stall = stallRows[0]

      // ✅ Safe stall deduction
      const [stallDeduct] = await conn.execute(
        `UPDATE food_stall
         SET coins = coins - ?
         WHERE stall_id=? AND coins >= ?`,
        [amt, stall_id, amt]
      )

      if (stallDeduct.affectedRows === 0)
        throw new Error("Insufficient stall balance")

      // 🔒 Lock user row
      const [userRows] = await conn.execute(
        `SELECT user_id, name, email
         FROM user
         WHERE user_id=? FOR UPDATE`,
        [user_id]
      )

      if (userRows.length === 0) throw new Error("User not found")

      const user = userRows[0]

      // ✅ Credit user
      await conn.execute(
        `UPDATE user
         SET coins = coins + ?
         WHERE user_id=?`,
        [amt, user_id]
      )

      // ✅ Log (DB-trusted data only)
      const senderId = `s${stall.stall_id}`
      const receiverId = `u${user.user_id}`

      const [insertRes] = await conn.execute(
        `INSERT INTO superadmin_log
         (sender_id, sender_name, sender_email,
          receiver_id, receiver_name, receiver_email,
          amount,reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          senderId,
          stall.stall_name,
          stall.email,
          receiverId,
          user.name,
          user.email,
          amt,
          reason 
        ]
      )

      return { reverse_id: insertRes.insertId }
    })

    return NextResponse.json({
      message: "Reverse transaction successful",
      ...result
    })

  } catch (err) {
    console.error("REVERSE TX ERROR:", err)

    if (
      err.message === "Stall not found" ||
      err.message === "User not found" ||
      err.message === "Insufficient stall balance"
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Reverse transaction failed" },
      { status: 500 }
    )
  }
}
