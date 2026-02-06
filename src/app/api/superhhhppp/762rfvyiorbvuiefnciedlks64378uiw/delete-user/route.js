import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken3 } from "@/lib/jwt";
import withTransaction from "@/lib/withTransaction";

export async function POST(req) {
  try {
    /* ===============================
       1️⃣ SUPERADMIN AUTH
    =============================== */
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken3(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    /* ===============================
       2️⃣ INPUT VALIDATION
    =============================== */
    const { user_id, reason } = await req.json();

    if (
      !user_id ||
      !Number.isInteger(Number(user_id)) ||
      !reason ||
      !reason.trim()
    ) {
      return NextResponse.json(
        { error: "user_id and delete reason are required" },
        { status: 400 }
      );
    }

    /* ===============================
       3️⃣ TRANSACTION
    =============================== */
    await withTransaction(async (conn) => {
      /* 🔒 Lock user row */
      const [rows] = await conn.execute(
        `SELECT *
         FROM user
         WHERE user_id = ?
         FOR UPDATE`,
        [user_id]
      );

      if (rows.length === 0) {
        throw new Error("User not found");
      }

      const user = rows[0];

      /* 🗃️ Copy to deleted_user */
      await conn.execute(
        `INSERT INTO deleted_user (
          user_id, name, email, phone, coins,
          created_at, deleted_by, delete_reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.user_id,
          user.name,
          user.email,
          user.phone,
          user.coins,
          user.created_at,
          payload.email, // admin email from token
          reason
        ]
      );

      /* ❌ Delete from user table */
      await conn.execute(
        `DELETE FROM user WHERE user_id = ?`,
        [user_id]
      );
    });

    /* ===============================
       4️⃣ SUCCESS
    =============================== */
    return NextResponse.json({
      message: "User deleted successfully"
    });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    if (err.message === "User not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
