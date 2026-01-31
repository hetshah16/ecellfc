import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

    /* ---------- RATE LIMIT: PHONE ---------- */
    const [phoneRows] = await pool.execute(
      `
      SELECT COUNT(*) AS count
      FROM otp_requests
      WHERE phone = ?
      AND created_at > NOW() - INTERVAL 10 MINUTE
      `,
      [phone]
    );
    // console.log(phoneRows[0],"phonerows");
    if (phoneRows[0].count >= 3) {
        return NextResponse.json(
            { error: "Too many OTP requests for this number. Try after 10 minutes or contact the team." },
            { status: 429 }
        );
    }
    
    /* ---------- RATE LIMIT: IP ---------- */
    const [ipRows] = await pool.execute(
        `
        SELECT COUNT(*) AS count
        FROM otp_requests
        WHERE ip_address = ?
        AND created_at > NOW() - INTERVAL 1 HOUR
        `,
        [ip]
    );
    
    // console.log(ipRows[0],"iprows");
    if (ipRows[0].count >= 10) {
      return NextResponse.json(
        { error: "Too many requests from this IP. Try Later." },
        { status: 429 }
      );
    }

    /* ---------- ALLOWED ---------- */
    return NextResponse.json({ allowed: true });

  } catch (err) {
    console.error("OTP request error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
