import pool from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken3 } from "@/lib/jwt";
import withTransaction from "@/lib/withTransaction";

export async function POST(req) {
  try {
    /* ===============================
       1️⃣ AUTHENTICATION (SUPERADMIN)
    =============================== */
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Only superadmin secret can verify this
    const payload = verifyToken3(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired or invalid token" },
        { status: 401 }
      );
    }

    /* ===============================
       2️⃣ INPUT VALIDATION
    =============================== */
    const body = await req.json();
    const { user_id, amount, reason } = body;

    const amt = Number(amount);

    if (
      !user_id ||
      !Number.isInteger(Number(user_id)) ||
      !amt ||
      amt <= 0 ||
      !reason.trim()
    ) {
      return NextResponse.json(
        { error: "Invalid input: user_id, positive amount and reason required" },
        { status: 400 }
      );
    }

    /* ===============================
       3️⃣ CONSTANT RECEIVER (ECELL)
       ❗ NEVER TRUST FRONTEND
    =============================== */
    const receiver_id = "E-cell";
    const receiver_name = "E-Cell";
    const receiver_email = "ecell@spit.ac.in";

    /* ===============================
       4️⃣ DB TRANSACTION
    =============================== */
    const result = await withTransaction(async (conn) => {
      /* 🔒 Lock user row */
      const [userRows] = await conn.execute(
        `SELECT user_id, name, email, coins
         FROM user
         WHERE user_id = ?
         FOR UPDATE`,
        [user_id]
      );

      if (userRows.length === 0) {
        throw new Error("User not found");
      }

      const user = userRows[0];

      /* ❗ Final balance check (no race condition) */
      if (user.coins < amt) {
        throw new Error("Insufficient user balance");
      }

      /* ➖ Deduct coins */
      await conn.execute(
        `UPDATE user
         SET coins = coins - ?
         WHERE user_id = ?`,
        [amt, user_id]
      );

      /* 📝 Log reverse transaction */
      const sender_id = `u${user.user_id}`;

      const [insertRes] = await conn.execute(
        `INSERT INTO superadmin_log (
          sender_id, sender_name, sender_email,
          receiver_id, receiver_name, receiver_email,
          amount, reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sender_id,
          user.name,
          user.email,
          receiver_id,
          receiver_name,
          receiver_email,
          amt,
          reason
        ]
      );

      return { reverse_id: insertRes.insertId };
    });

    /* ===============================
       5️⃣ SUCCESS RESPONSE
    =============================== */
    return NextResponse.json({
      message: "Reverse recharge successful",
      ...result
    });

  } catch (err) {
    console.error("REVERSE RECHARGE ERROR:", err);

    if (
      err.message === "User not found" ||
      err.message === "Insufficient user balance"
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Reverse recharge failed" },
      { status: 500 }
    );
  }
}
