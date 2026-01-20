import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
export async function GET(req) {
    try{
    // ✅ 1. Read token from HTTP-only cookie
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ✅ 2. Verify token safely
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 })
    }

    const user_id = payload.user_id

    // ✅ 3. Get request data
    const [rows] = await pool.execute(
    `
    SELECT 
    receiver_name AS name,
    receiver_id AS email,
    -amount AS amount,
    timestamp
    FROM transaction_log
    WHERE sender_id = ?
    ORDER BY timestamp DESC;
    `,
    [user_id]
    );
    return new Response(
      JSON.stringify(rows),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
    }catch(error){
        console.error(error);
        return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
    }
}