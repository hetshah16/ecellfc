import { NextResponse } from "next/server";
import pool from "@/lib/db"; // your MySQL connection pool

export async function POST(req) {
  try {
    const { item_id, new_price, stall_id } = await req.json();

    // Validate required fields
    if (!item_id || !new_price || !stall_id) {
      return NextResponse.json(
        { error: "item_id, new_price, and stall_id are required" },
        { status: 400 }
      );
    }

    // Insert into database
    const [result] = await pool.execute(
      "UPDATE food_item SET price = ? WHERE item_id = ? AND stall_id = ?",
      [new_price, item_id, stall_id]
    );

    return NextResponse.json({ success: true, item_id: result.insertId });
  } catch (err) {
    console.error("update item error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
    
  }
}

