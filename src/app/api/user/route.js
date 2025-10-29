import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { user_id } = await req.json(); // ✅ await here

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
