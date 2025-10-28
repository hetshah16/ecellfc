// server API route
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM user limit 1"
    );

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/stalls error", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
