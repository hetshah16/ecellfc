import { NextResponse } from "next/server";
import pool from "@/lib/db"; // your MySQL connection pool

export async function POST(req) {
  try {
    const { item_name, price, stall_id } = await req.json();

    // Validate required fields
    if (!item_name || !price || !stall_id) {
      return NextResponse.json(
        { error: "item_name, price, and stall_id are required" },
        { status: 400 }
      );
    }

    // Insert into database
    const [result] = await pool.execute(
      "INSERT INTO food_item (item_name, price, stall_id) VALUES (?, ?, ?)",
      [item_name, price, stall_id]
    );

    return NextResponse.json({ success: true, item_id: result.insertId });
  } catch (err) {
    console.error("Add item error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

