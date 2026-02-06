import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
export async function POST(req) {
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
    const user_id = payload.user_id

    // ✅ 3. Query user data from database

    const [rows] = await pool.execute(
      "SELECT * FROM user WHERE user_id = ?", 
      [user_id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("POST /api/stalls error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
