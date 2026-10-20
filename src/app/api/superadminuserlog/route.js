import pool from "@/lib/db"
import { verifyToken } from "@/lib/jwt"
import { NextResponse } from "next/server"

export async function GET(req) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return NextResponse.json(
      { error: "Invalid session. Please log in again." },
      { status: 401 }
    )
  }

  try {
    const userId = payload.user_id
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM (
        SELECT
          CONCAT('#SU', reverse_id) AS id,
          sender_name AS name,
          sender_email AS email,
          amount,
          created_at AS timestamp
        FROM superadmin_log
        WHERE receiver_id = CONCAT('u', ?)

        UNION ALL

        SELECT
          CONCAT('#UA', reverse_id) AS id,
          receiver_name AS name,
          receiver_email AS email,
          -amount AS amount,
          created_at AS timestamp
        FROM superadmin_log
        WHERE sender_id = CONCAT('u', ?)
      ) user_transactions
      ORDER BY timestamp DESC
      `,
      [userId, userId]
    )

    return NextResponse.json(rows)
  } catch (error) {
    console.error("SUPERADMIN USER LOG ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
