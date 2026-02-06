import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db"; // adjust import path if needed
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
    const user_id = payload.user_id;
    const { password, pin } = await req.json();

    if (!user_id || !password || !pin) {
      return NextResponse.json(
        { error: "Missing required fields (user_id, password, pin)" },
        { status: 400 }
      );
    }

    // ✅ Fetch user first
    const [rows] = await pool.execute("SELECT * FROM user WHERE user_id = ?", [user_id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // ✅ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Update PIN
    await pool.execute("UPDATE user SET pin = ? WHERE user_id = ?", [pin, user_id]);

    return NextResponse.json({ success: true, message: "PIN updated successfully" });
  } catch (err) {
    console.error("Error updating PIN:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
