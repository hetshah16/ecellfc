import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req) {
  try {
    const { stall_id } = await req.json();

    if (!stall_id) {
      return NextResponse.json({ error: "stall_id is required" }, { status: 400 });
    }

    const [rows] = await pool.execute(
      `Select transaction_id,sender_id,sender_name,sender_email,amount,timestamp from transaction_log WHERE receiver_id = ? ORDER BY timestamp DESC`,
      [stall_id]
    );

    return NextResponse.json({ transactions: rows });
  } catch (err) {
    console.error("Fetch transaction logs error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
