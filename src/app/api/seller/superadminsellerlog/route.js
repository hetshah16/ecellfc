import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyToken2 } from "@/lib/jwt"

export async function GET(req) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken2(token)
  } catch {
    return NextResponse.json(
      { error: "Invalid session. Please log in again." },
      { status: 401 }
    )
  }

  if (!payload.seller_id) {
    return NextResponse.json({ error: "Invalid seller session" }, { status: 401 })
  }

  try {
    const [transactions] = await pool.execute(
      `
      SELECT
        CONCAT('#SU', reverse_id) AS id,
        receiver_name AS name,
        receiver_email AS email,
        -amount AS amount,
        created_at AS timestamp
      FROM superadmin_log
      WHERE sender_id = CONCAT('s', ?)
      ORDER BY created_at DESC
      `,
      [payload.seller_id]
    )

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Fetch superadmin seller logs error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
