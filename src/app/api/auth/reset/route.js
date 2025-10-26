// src/app/api/auth/reset/route.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, token, newPassword } = await req.json();
    if (!email || !token || !newPassword) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // find token
    const [rows] = await pool.execute(
      "SELECT id, expires_at, used FROM password_resets WHERE email = ? AND token = ? ORDER BY id DESC LIMIT 1",
      [email, token]
    );

    if (!rows.length) return new Response(JSON.stringify({ error: "Invalid token" }), { status: 400 });

    const row = rows[0];
    if (row.used) return new Response(JSON.stringify({ error: "Token already used" }), { status: 400 });

    const expires = new Date(row.expires_at);
    if (expires < new Date()) return new Response(JSON.stringify({ error: "Token expired" }), { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);

    // update user password
    await pool.execute("UPDATE user SET password = ? WHERE email = ?", [hashed, email]);

    // mark token used
    await pool.execute("UPDATE password_resets SET used = 1 WHERE id = ?", [row.id]);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
