import { NextResponse } from "next/server";
import { verifyToken3 } from "@/lib/jwt";

export async function GET(req) {
  // Read the HTTP-only cookie
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verifyToken3(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Return user data
  return NextResponse.json({ admin: payload });
}
