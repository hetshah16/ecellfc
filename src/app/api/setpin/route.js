
import pool from "@/lib/db";


export async function POST(req) {
  try {
    const { email, pin } = await req.json();

    // Validation
    if (!email || !/^\d{4}$/.test(pin)) {
      return Response.json({ error: "Invalid user ID or PIN format" }, { status: 400 });
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
