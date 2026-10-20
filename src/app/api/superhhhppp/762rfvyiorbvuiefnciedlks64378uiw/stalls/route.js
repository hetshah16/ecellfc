// src/app/api/admin/stalls/route.js
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { verifyToken3 } from "@/lib/jwt";

function parseBodyJson(req) {
  return req.json ? req.json() : Promise.reject(new Error("Missing body parser"));
}

function getSuperadminPayload(req) {
  const token = req.cookies.get("token");
  if (!token) {
    throw Object.assign(new Error("Not authenticated"), { status: 401 });
  }
  return verifyToken3(token.value);
}

async function verifySuperadminPassword(email, password) {
  const [rows] = await pool.execute(
    "SELECT password FROM superadmin WHERE email = ?",
    [email]
  );
  return rows.length > 0 && await bcrypt.compare(password, rows[0].password);
}

export async function GET(req) {
  try {
    getSuperadminPayload(req);
    const [rows] = await pool.execute(
      `SELECT stall_id, stall_name, email, coins, created_at, updated_at
       FROM food_stall
       ORDER BY stall_id DESC`
    );
    return NextResponse.json({ ok: true, rows });
  } catch (err) {
    if (err.status === 401) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Session expired or invalid token" },
        { status: 401 }
      );
    }
    console.error("GET /api/admin/stalls error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    getSuperadminPayload(req);
    const body = await parseBodyJson(req);
    const { stall_name, email, password, coins } = body || {};

    // basic validation
    if (!stall_name || !email || !password) {
      return NextResponse.json({ error: "stall_name, email and password are required" }, { status: 400 });
    }
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }
    const initialCoins = Number(coins || 0);
    if (Number.isNaN(initialCoins) || initialCoins < 0) {
      return NextResponse.json({ error: "Invalid coins value" }, { status: 400 });
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
      return NextResponse.json({
        ok: true,
        stall: { stall_id: insertedId, stall_name, email, coins: initialCoins }
      }, { status: 201 });

    } catch (dbErr) {
      console.error("DB insert error /api/admin/stalls:", dbErr);
      // handle unique email error (MySQL ER_DUP_ENTRY)
      if (dbErr && dbErr.code === "ER_DUP_ENTRY") {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

  } catch (err) {
    if (err.status === 401) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Session expired or invalid token" },
        { status: 401 }
      );
    }
    console.error("POST /api/admin/stalls error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req) {
  try {
    const payload = getSuperadminPayload(req);
    const { stall_id, stall_name, new_password, superadmin_password } = await req.json();
    const stallId = Number(stall_id);

    if (!Number.isInteger(stallId) || stallId <= 0) {
      return NextResponse.json({ error: "Invalid stall ID" }, { status: 400 });
    }
    if (typeof stall_name !== "string" || !stall_name.trim()) {
      return NextResponse.json({ error: "Stall name is required" }, { status: 400 });
    }
    if (new_password && (typeof new_password !== "string" || new_password.length < 6)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const updates = ["stall_name = ?"];
    const values = [stall_name.trim()];

    if (new_password) {
      if (!superadmin_password) {
        return NextResponse.json(
          { error: "Superadmin password is required to change a stall password" },
          { status: 400 }
        );
      }
      if (!(await verifySuperadminPassword(payload.email, superadmin_password))) {
        return NextResponse.json(
          { error: "Invalid superadmin password" },
          { status: 401 }
        );
      }
      updates.push("password = ?");
      values.push(await bcrypt.hash(new_password, 10));
    }

    values.push(stallId);
    const [result] = await pool.execute(
      `UPDATE food_stall SET ${updates.join(", ")} WHERE stall_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      const [stalls] = await pool.execute(
        "SELECT stall_id FROM food_stall WHERE stall_id = ?",
        [stallId]
      );
      if (stalls.length === 0) {
        return NextResponse.json({ error: "Stall not found" }, { status: 404 });
      }
    }
    return NextResponse.json({ ok: true, message: "Stall updated successfully" });
  } catch (err) {
    if (err.status === 401) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Session expired or invalid token" },
        { status: 401 }
      );
    }
    console.error("PATCH /api/admin/stalls error:", err);
    return NextResponse.json({ error: "Failed to update stall" }, { status: 500 });
  }
}
