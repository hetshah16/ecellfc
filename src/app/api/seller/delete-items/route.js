import { NextResponse } from "next/server";
import pool from "@/lib/db"; // your MySQL connection pool

export async function POST(req) {
  try {
    const { item_id, stall_id } = await req.json();

    // Validate required fields
    if (!item_id || !stall_id) {
      return NextResponse.json(
        { error: "item_id and stall_id are required" },
        { status: 400 }
      );
    }

    // Insert into database
    const [result] = await pool.execute(
      "DELETE FROM food_item WHERE item_id = ? AND stall_id = ?",
      [item_id, stall_id]
    );

    return NextResponse.json({ success: true, item_id: result.insertId });
  } catch (err) {
    console.error("delete item error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    
  }
}

