import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import withTransaction from "@/lib/withTransaction"

export const runtime = "nodejs"

export async function POST(request) {
  const token = request.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 })
  }

  if (!payload?.user_id) {
    return NextResponse.json({ error: "Invalid user session" }, { status: 401 })
  }

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
  const keyId = process.env.RAZORPAY_KEY_ID
  if (!keySecret || !keyId) {
    console.error("Razorpay payment verification requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET")
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

  let order
  let payment
  try {
    const authorization = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`
    const [orderResponse, paymentResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, {
        headers: { Authorization: authorization },
        cache: "no-store",
      }),
      fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
        headers: { Authorization: authorization },
        cache: "no-store",
      }),
    ])

    if (!orderResponse.ok || !paymentResponse.ok) {
      return NextResponse.json({ error: "Unable to confirm payment with Razorpay" }, { status: 502 })
    }

    ;[order, payment] = await Promise.all([orderResponse.json(), paymentResponse.json()])
  } catch (error) {
    console.error("Razorpay payment lookup failed:", error)
    return NextResponse.json({ error: "Unable to confirm payment with Razorpay" }, { status: 502 })
  }

  if (
    order.id !== razorpay_order_id ||
    String(order.notes?.user_id) !== String(payload.user_id) ||
    order.currency !== "INR" ||
    !Number.isSafeInteger(order.amount) ||
    payment.id !== razorpay_payment_id ||
    payment.order_id !== razorpay_order_id ||
    payment.status !== "captured" ||
    payment.currency !== "INR" ||
    payment.amount !== order.amount
  ) {
    return NextResponse.json({ error: "Payment is not captured or does not match this account" }, { status: 400 })
  }

  try {
    const result = await withTransaction(async (conn) => {
      const [users] = await conn.execute(
        "SELECT user_id, name, email FROM user WHERE user_id = ? FOR UPDATE",
        [payload.user_id]
      )
      if (users.length === 0) throw new Error("USER_NOT_FOUND")

      const [existingPayments] = await conn.execute(
        "SELECT recharge_id FROM recharge_log WHERE razorpay_payment_id = ? FOR UPDATE",
        [razorpay_payment_id]
      )
      if (existingPayments.length > 0) return { alreadyProcessed: true }

      const user = users[0]
      const amount = order.amount / 100
      await conn.execute("UPDATE user SET coins = coins + ? WHERE user_id = ?", [amount, user.user_id])
      await conn.execute(
        "INSERT INTO recharge_log (receiver_id, receiver_name, receiver_email, method, amount, razorpay_payment_id) VALUES (?, ?, ?, ?, ?, ?)",
        [user.user_id, user.name, user.email, "Razorpay", amount, razorpay_payment_id]
      )

      return { alreadyProcessed: false }
    })

    return NextResponse.json({
      verified: true,
      credited: !result.alreadyProcessed,
      razorpay_order_id,
      razorpay_payment_id,
    })
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({
        verified: true,
        credited: false,
        razorpay_order_id,
        razorpay_payment_id,
      })
    }

    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User account not found" }, { status: 404 })
    }

    console.error("Payment recharge failed:", error)
    return NextResponse.json({ error: "Payment was verified but the recharge could not be completed" }, { status: 500 })
  }
}
