import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt"; // <-- use helper

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [rows] = await pool.execute("SELECT * FROM user WHERE email = ?", [email]);
    if (!rows.length) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Use your centralized helper
    const token = signToken({ user_id: user.user_id, email: user.email, name: user.name });

    const response = NextResponse.json({
      message: "Login successful",
      user: { user_id: user.user_id, name: user.name, email: user.email },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 5,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
