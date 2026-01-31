import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    await pool.execute(
      `
      INSERT INTO otp_requests (phone, ip_address)
      VALUES (?, ?)
      `,
      [phone, ip]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("OTP log error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
