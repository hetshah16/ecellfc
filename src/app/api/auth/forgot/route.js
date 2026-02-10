// src/app/api/auth/forgot/route.js
import pool from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

const smtpUsers = JSON.parse(process.env.SMTP_USER_ARR || "[]");
const smtpPasswords = JSON.parse(process.env.SMTP_PASS_ARR || "[]");
const size = smtpUsers.length;

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
    const [requests] = await pool.execute("SELECT COUNT(*) AS count FROM password_resets WHERE email = ? AND created_at > NOW() - INTERVAL 10 MINUTE", [email]);

    if (requests[0].count >= 3) {
      return new Response(JSON.stringify({ error: "Too many password reset requests. Try after 10 hours or contact the team." }), { status: 429 });
    }

    // create token
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60 * 1000;
    const expires = new Date(Date.now() + 1000 * 60 * 60-offset).toISOString().slice(0, 19).replace('T', ' '); // 1 hour

    // store token
    const [result]=await pool.execute(
      "INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expires]
    );

    if (size === 0 || smtpPasswords.length !== size) {
      throw new Error("SMTP env config invalid");
    }

    // modulo logic
    const index = result.insertId % size;

    const SMTP_USER = smtpUsers[index];
    const SMTP_PASS = smtpPasswords[index];

    // create transporter dynamically
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });


    // send email with reset link
    const resetUrl = `${process.env.APP_URL}/auth/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "E-Cell Food Challenge <het.shah23@spit.ac.in>",
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
