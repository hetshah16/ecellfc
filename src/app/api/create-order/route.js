import { randomUUID } from "node:crypto"
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

  const amount = body?.amount
  if (!Number.isSafeInteger(amount) || amount < 100) {
    return NextResponse.json({ error: "Amount must be at least 100 paise" }, { status: 400 })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error("Razorpay order creation requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")
    return NextResponse.json({ error: "Payment service is not configured" }, { status: 500 })
  }

  let response
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `ecell-${randomUUID().replaceAll("-", "")}`,
      }),
    })
  } catch (error) {
    console.error("Razorpay order request failed:", error)
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 500 })
  }

  let order
  try {
    order = await response.json()
  } catch (error) {
    console.error("Razorpay returned an invalid order response:", error)
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 500 })
  }

  if (!response.ok) {
    console.error("Razorpay order creation failed with status:", response.status)
    const status = response.status === 401 ? 401 : 500
    return NextResponse.json(
      { error: status === 401 ? "Razorpay authentication failed" : "Unable to create payment order" },
      { status }
    )
  }

  return NextResponse.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: keyId,
  })
}
