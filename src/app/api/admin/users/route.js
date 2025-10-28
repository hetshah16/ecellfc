// server-side: returns basic user list (id, name, email, coins)
// NOTE: protect this endpoint in production with admin auth
import pool from "@/lib/db";

export async function GET(req) {
  try {
    const [rows] = await pool.execute("SELECT user_id, name, email, coins FROM user ORDER BY user_id DESC");
    return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("GET /api/admin/users error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
