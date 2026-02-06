
import pool from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server"; 

export async function POST(req) {
  try {
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

    const email = payload.email
    const { pin } = await req.json();
    console.log(email, pin);
    // Validation
    if (!/^\d{4}$/.test(pin)) 
      { return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 }); 
    }

    // Update PIN
    const [result] = await pool.execute(
      "UPDATE user SET pin = ? WHERE email = ?",
      [pin, email]
    );


    if (result.affectedRows === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "PIN updated successfully" });
  } catch (error) {
    console.error("Error updating PIN:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
    
  }
}
