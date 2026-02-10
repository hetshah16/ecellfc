import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { phone,email } = await req.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }
    
    const [existing] = await pool.execute("SELECT * FROM user WHERE email = ?", [email]);
    if (existing.length) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 400 });
    }
    const [existingPhone] = await pool.execute("SELECT * FROM user WHERE phone = ?", [phone]);
    if (existingPhone.length) {
      return new Response(JSON.stringify({ error: "Phone number already in use" }), { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown";

      
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
        AND created_at > NOW() - INTERVAL 10 MINUTE
        `,
        [ip]
    );
    
    // console.log(ipRows[0],"iprows");
    if (ipRows[0].count >= 100) {
      return NextResponse.json(
        { error: "Too many requests from this IP. Try Later or Try using different network." },
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
