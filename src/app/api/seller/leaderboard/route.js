import pool from "@/lib/db";
import { verifyToken2 } from "@/lib/jwt"; // your token verification function
export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken2(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    const [rows] = await pool.execute(
      `
      SELECT 
        stall_id,
        stall_name,
        coins
      FROM food_stall
      ORDER BY coins DESC
      `
    );

    return new Response(
      JSON.stringify(rows),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("GET /api/admin/leaderboard error", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
