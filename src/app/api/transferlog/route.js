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
    SELECT *
    FROM (
        SELECT 
            CONCAT('#T', transfer_id) AS id,
            receiver_name AS name,
            receiver_email AS email,
            -amount AS amount,
            timestamp
        FROM transfer_log
        WHERE sender_id = ?

        UNION ALL

        SELECT 
            CONCAT('#T', transfer_id) AS id,
            sender_name AS name,
            sender_email AS email,
            amount,
            timestamp
        FROM transfer_log
        WHERE receiver_id = ?
    ) t
    ORDER BY timestamp DESC
    `,
    [user_id, user_id]
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