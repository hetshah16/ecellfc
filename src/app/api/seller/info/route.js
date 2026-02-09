import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken2 } from "@/lib/jwt"; // your token verification function
export async function POST(req) {
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
    const { stall_id } = await req.json(); // ✅ await here

    const [rows] = await pool.execute(
      "SELECT * FROM food_stall WHERE stall_id = ?", 
      [stall_id]
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
