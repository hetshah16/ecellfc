// server API route
import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
export async function GET(req) {
  try {
    // ✅ 1. Read token from HTTP-only cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ✅ 2. Verify token safely
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 })
    }

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
