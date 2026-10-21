import pool from "@/lib/db"

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    // ✅ force integers & clamp values
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1)
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 50)
    const offset = (page - 1) * limit

    const sql = `
      SELECT
        spending.user_id,
        spending.name,
        spending.email,
        spending.coins - COALESCE(refunds.coins, 0) AS coins
      FROM (
        SELECT
          sender_id AS user_id,
          sender_name AS name,
          sender_email AS email,
          SUM(amount) AS coins
        FROM transaction_log
        GROUP BY sender_id, sender_name, sender_email
      ) spending
      LEFT JOIN (
        SELECT
          receiver_id,
          SUM(amount) AS coins
        FROM superadmin_log
        WHERE sender_id LIKE 's%'
          AND receiver_id LIKE 'u%'
        GROUP BY receiver_id
      ) refunds ON refunds.receiver_id = CONCAT('u', spending.user_id)
      ORDER BY coins DESC
      LIMIT ${offset}, ${limit}
    `

    const [rows] = await pool.query(sql) // ✅ NOT execute

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("Best eaters pagination error", err)

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    )
  }
}
