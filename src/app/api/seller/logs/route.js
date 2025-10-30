import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { stall_id } = await req.json();

    if (!stall_id) {
      return NextResponse.json({ error: "stall_id is required" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `SELECT tl.transaction_id, tl.sender_id, u.name AS sender_name,
              tl.amount, tl.timestamp
       FROM transaction_log tl
       JOIN user u ON tl.sender_id = u.user_id
       WHERE tl.receiver_id = ?
       ORDER BY tl.timestamp DESC`,
      [stall_id]
    );

    return NextResponse.json({ transactions: rows });
  } catch (err) {
    console.error("Fetch transaction logs error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
