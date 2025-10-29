import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // 🧹 Overwrite the token cookie with an expired one
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    path: "/",
    expires: new Date(0), // set in the past
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return response;
}
