import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyToken3 } from "@/lib/jwt"

const logTables = {
  transaction: { table: "transaction_log", timestamp: "timestamp" },
  transfer: { table: "transfer_log", timestamp: "timestamp" },
  recharge: { table: "recharge_log", timestamp: "timestamp" },
  superadmin: { table: "superadmin_log", timestamp: "created_at" },
}

export async function GET(req) {
  const token = req.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    verifyToken3(token)
  } catch {
    return NextResponse.json(
      { error: "Session expired or invalid token" },
      { status: 401 }
    )
  }

  const type = new URL(req.url).searchParams.get("type")
  const log = logTables[type]
  if (!log) {
    return NextResponse.json({ error: "Invalid log type" }, { status: 400 })
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${log.table} ORDER BY ${log.timestamp} DESC`
    )
    return NextResponse.json({ rows })
  } catch (error) {
    console.error(`Failed to fetch ${type} logs:`, error)
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
