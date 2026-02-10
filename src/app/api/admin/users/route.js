// server-side: returns basic user list (id, name, email, coins)
// NOTE: protect this endpoint in production with admin auth
import pool from "@/lib/db";
import { verifyToken1 } from "@/lib/jwt"; // your token verification function
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken1(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    const [rows] = await pool.execute("SELECT user_id, name, email, coins FROM user ORDER BY user_id DESC");
    return new Response(JSON.stringify(rows), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("GET /api/admin/users error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
