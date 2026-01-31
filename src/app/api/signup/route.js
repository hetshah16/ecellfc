import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password,phone } = await req.json();


    const [rows] = await pool.execute(
  `
  SELECT 1 FROM otp_requests
  WHERE phone = ?
  AND created_at > NOW() - INTERVAL 10 MINUTE
  LIMIT 1
  `,
  [phone]
);

if (!rows.length) {
  return NextResponse.json(
    { error: "Phone number not verified" },
    { status: 403 }
  );
}
    // Check if email exists
    const [existing] = await pool.execute("SELECT * FROM user WHERE email = ?", [email]);
    if (existing.length) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 400 });
    }
    const [existingPhone] = await pool.execute("SELECT * FROM user WHERE phone = ?", [phone]);
    if (existingPhone.length) {
      return new Response(JSON.stringify({ error: "Phone number already in use" }), { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      "INSERT INTO user (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashed, phone]
    );

    return new Response(JSON.stringify({ user_id: result.insertId, name, email }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
