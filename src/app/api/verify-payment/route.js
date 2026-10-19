import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import dotenv from 'dotenv';
dotenv.config();
export const runtime = "nodejs"

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required" }, { status: 400 })
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {}
  if (
    typeof razorpay_order_id !== "string" ||
    !razorpay_order_id ||
    typeof razorpay_payment_id !== "string" ||
    !razorpay_payment_id ||
    typeof razorpay_signature !== "string" ||
    !/^[\da-f]{64}$/i.test(razorpay_signature)
  ) {
    return NextResponse.json({ error: "Missing or invalid payment verification fields" }, { status: 400 })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    console.error("Razorpay payment verification requires RAZORPAY_KEY_SECRET")
    return NextResponse.json({ error: "Payment service is not configured" }, { status: 500 })
  }

  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest()
  const providedSignature = Buffer.from(razorpay_signature, "hex")

  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) {
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 })
  }

  return NextResponse.json({
    verified: true,
    razorpay_order_id,
    razorpay_payment_id,
  })
}
