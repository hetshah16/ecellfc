import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken2 } from "@/lib/jwt";

export async function POST(req) {
  try {
    // 🔐 Read token from cookie
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 🔐 Verify JWT
    const payload = verifyToken2(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const seller_id = payload.seller_id;

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Fetch seller
    const [rows] = await pool.execute(
      "SELECT stall_id, password FROM food_stall WHERE stall_id = ?",
      [seller_id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      );
    }

    const seller = rows[0];

    // 🔍 Verify current password
    const ok = await bcrypt.compare(currentPassword, seller.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 401 }
      );
    }
    if(newPassword.length<6){
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password
    await pool.execute(
      "UPDATE food_stall SET password = ? WHERE stall_id = ?",
      [hashedPassword, seller_id]
    );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );

  } catch (err) {
    console.error("POST /api/seller/update-password error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
