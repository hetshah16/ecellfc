// server API route
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT stall_id, stall_name, coins, created_at, updated_at FROM food_stall ORDER BY stall_name ASC"
    );

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/stalls error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
