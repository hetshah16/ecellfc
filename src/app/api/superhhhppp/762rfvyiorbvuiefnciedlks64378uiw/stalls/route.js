// src/app/api/admin/stalls/route.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyToken3 } from "@/lib/jwt"; // your token verification function
/*
Supports:
  GET  -> list all stalls (ordered newest first)
  POST -> create a new stall
*/

function parseBodyJson(req) {
  return req.json ? req.json() : Promise.reject(new Error("Missing body parser"));
}

export async function GET() {
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
    const [rows] = await pool.execute(
      `SELECT stall_id, stall_name, email, coins, created_at, updated_at
       FROM food_stall
       ORDER BY stall_id DESC`
    );
    return new Response(JSON.stringify({ ok: true, rows }), { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/stalls error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await parseBodyJson(req);
    const { stall_name, email, password, coins } = body || {};

    // basic validation
    if (!stall_name || !email || !password) {
      return new Response(JSON.stringify({ error: "stall_name, email and password are required" }), { status: 400 });
    }
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400 });
    }
    const initialCoins = Number(coins || 0);
    if (Number.isNaN(initialCoins) || initialCoins < 0) {
      return new Response(JSON.stringify({ error: "Invalid coins value" }), { status: 400 });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.execute(
        `INSERT INTO food_stall (stall_name, email, password, coins) VALUES (?, ?, ?, ?)`,
        [stall_name, email, hashed, initialCoins]
      );

      const insertedId = result.insertId;
      // return the inserted row subset
      return new Response(JSON.stringify({
        ok: true,
        stall: { stall_id: insertedId, stall_name, email, coins: initialCoins }
      }), { status: 201 });

    } catch (dbErr) {
      console.error("DB insert error /api/admin/stalls:", dbErr);
      // handle unique email error (MySQL ER_DUP_ENTRY)
      if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
        return new Response(JSON.stringify({ error: "Email already in use" }), { status: 409 });
      }
      return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }

  } catch (err) {
    console.error("POST /api/admin/stalls error:", err);
    return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}
