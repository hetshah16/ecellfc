import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken3 } from "@/lib/jwt"; // your token verification function
export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only superadmin secret can verify this
    const payload = verifyToken3(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired or invalid token" },
        { status: 401 }
      );
    }
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
