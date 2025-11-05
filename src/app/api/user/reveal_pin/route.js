import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    // Read token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify JWT
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const user_id = payload.user_id;
    const { password } = await req.json();

    // ✅ Must select `pin`
    const [users] = await pool.execute(
      "SELECT user_id, name, coins, password, pin FROM user WHERE user_id=?",
      [user_id]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Success
    return NextResponse.json({ pin: user.pin }, { status: 200 });

  } catch (err) {
    console.error("POST /api/user/reveal-pin error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
