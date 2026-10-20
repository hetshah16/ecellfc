import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyToken3 } from "@/lib/jwt"

function getSuperadminPayload(req) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    throw Object.assign(new Error("Not authenticated"), { status: 401 })
  }
  return verifyToken3(token)
}

function authError(req, error) {
  if (error.status === 401) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return NextResponse.json(
      { error: "Session expired or invalid token" },
      { status: 401 }
    )
  }
  return null
}

async function verifySuperadminPassword(email, password) {
  const [rows] = await pool.execute(
    "SELECT password FROM superadmin WHERE email = ?",
    [email]
  )
  return rows.length > 0 && await bcrypt.compare(password, rows[0].password)
}

export async function GET(req) {
  try {
    getSuperadminPayload(req)
    const [admins] = await pool.execute(
      `SELECT admin_id, email
       FROM admin
       WHERE is_superadmin = 0 OR is_superadmin IS NULL
       ORDER BY admin_id DESC`
    )
    return NextResponse.json({ admins })
  } catch (error) {
    const response = authError(req, error)
    if (response) return response
    console.error("GET superadmin admins error:", error)
    return NextResponse.json({ error: "Failed to load admins" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    getSuperadminPayload(req)
    const { email, password } = await req.json()
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.execute(
      "INSERT INTO admin (email, password, is_superadmin) VALUES (?, ?, FALSE)",
      [normalizedEmail, hashedPassword]
    )

    return NextResponse.json(
      { admin: { admin_id: result.insertId, email: normalizedEmail } },
      { status: 201 }
    )
  } catch (error) {
    const response = authError(req, error)
    if (response) return response
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }
    console.error("POST superadmin admins error:", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const payload = getSuperadminPayload(req)
    const { admin_id, new_password, superadmin_password } = await req.json()
    const adminId = Number(admin_id)

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 })
    }
    if (typeof new_password !== "string" || new_password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }
    if (typeof superadmin_password !== "string" || !superadmin_password) {
      return NextResponse.json(
        { error: "Superadmin password is required" },
        { status: 400 }
      )
    }
    if (!(await verifySuperadminPassword(payload.email, superadmin_password))) {
      return NextResponse.json(
        { error: "Invalid superadmin password" },
        { status: 401 }
      )
    }

    const [result] = await pool.execute(
      `UPDATE admin
       SET password = ?
       WHERE admin_id = ? AND (is_superadmin = 0 OR is_superadmin IS NULL)`,
      [await bcrypt.hash(new_password, 10), adminId]
    )
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Admin password updated successfully" })
  } catch (error) {
    const response = authError(req, error)
    if (response) return response
    console.error("PATCH superadmin admins error:", error)
    return NextResponse.json({ error: "Failed to update admin password" }, { status: 500 })
  }
}
