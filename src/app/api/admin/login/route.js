import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { signToken } from "@/lib/jwt"; // <-- use helper
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Find user by email
    const [rows] = await pool.execute("SELECT * FROM admin WHERE email = ?", [email]);
    if (!rows.length) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const admin = rows[0];

    // Compare password
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const token = signToken({ admin_id: admin.admin_id, email: admin.email});

    const response = NextResponse.json({
      message: "Login successful",
      user: {admin_id: admin.admin_id, email: admin.email},
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}