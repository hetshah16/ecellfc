import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken1 } from "@/lib/jwt";
import withTransaction from "@/lib/withTransaction";

export async function POST(req) {
  try {
    // ✅ 1. Extract & validate token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken1(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    // ✅ 2. Input validation
    const { user_id,email,name, amount, mode } = await req.json();
    if (!user_id || !amount || amount <= 0 || !mode) {
      return NextResponse.json(
        { error: "Invalid input. user_id, amount, and mode are required." },
        { status: 400 }
      );
    }

    // ✅ 3. Transaction logic
    const result = await withTransaction(async (conn) => {
      // Check if user exists + lock row
      const [rows] = await conn.query(
        "SELECT coins FROM user WHERE user_id = ? FOR UPDATE",
        [user_id]
      );

      if (rows.length === 0) {
        throw new Error("USER_NOT_FOUND");
      }

      // Update coins
      await conn.query(
        "UPDATE user SET coins = coins + ? WHERE user_id = ?",
        [amount, user_id]
      );

      // Log recharge
      await conn.query(
        "INSERT INTO recharge_log (receiver_id,receiver_name,receiver_email, method, amount) VALUES (? ,? ,? ,? , ?)",
        [user_id,name,email, mode, amount]
      );

      return true;
    });

    if (result) {
      return NextResponse.json(
        { success: true, message: "Recharge successful" },
        { status: 200 }
      );
    }

  } catch (err) {
    console.error("Recharge error:", err);

    // ✅ Map known errors to proper codes
    if (err.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Server error: Recharge could not be completed" },
      { status: 500 }
    );
  }
}
