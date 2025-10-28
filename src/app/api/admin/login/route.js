import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Find user by email
    const [rows] = await pool.execute("SELECT * FROM admin WHERE email = ?", [email]);
    if (!rows.length) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const user = rows[0];

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    // Return user info (or a JWT in real app)
    return new Response(JSON.stringify({ admin_id: user.admin_id, name: user.name, email: user.email }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
