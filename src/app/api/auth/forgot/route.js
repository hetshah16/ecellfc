// src/app/api/auth/forgot/route.js
import pool from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });

    // check user exists
    const [rows] = await pool.execute("SELECT user_id FROM user WHERE email = ?", [email]);
    if (!rows.length) {
      // For privacy, return success even if email is not found.
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // create token
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60 * 1000;
    const expires = new Date(Date.now() + 1000 * 60 * 60-offset).toISOString().slice(0, 19).replace('T', ' '); // 1 hour

    // store token
    await pool.execute(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expires]
    );

    // send email with reset link
    const resetUrl = `${process.env.APP_URL}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset your E-Cell Food password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
