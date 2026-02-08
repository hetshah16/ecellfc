import pool from "@/lib/db";

export async function GET(req) {
  try {
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
