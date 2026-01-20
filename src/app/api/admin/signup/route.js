import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const {name, email, password } = await req.json();

    // Check if email exists
    const [existing] = await pool.execute("SELECT * FROM admin WHERE email = ?", [email]);
    if (existing.length) {
      return new Response(JSON.stringify({ error: "Email already in use" }), { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      "INSERT INTO admin (email, password) VALUES (?, ?)",
      [email, hashed]
    );

    return new Response(JSON.stringify({ admin_id: result.insertId, email }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
