import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT user_id, name, email, coins FROM user ORDER BY user_id LIMIT 1"
    );

    if (!rows.length) {
      return new Response(JSON.stringify({ error: "No user found" }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/me error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
