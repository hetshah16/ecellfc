"use client"

import Script from "next/script"
import { useState } from "react"

export default function RazorpayPage() {
  const [amount, setAmount] = useState("")
  const [scriptReady, setScriptReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  async function handlePayment(event) {
    event.preventDefault()
    setError("")
    setMessage("")

    const amountInRupees = Number(amount)
    const unroundedAmountInPaise = amountInRupees * 100
    const amountInPaise = Math.round(unroundedAmountInPaise)
    if (
      !Number.isFinite(amountInRupees) ||
      !Number.isSafeInteger(amountInPaise) ||
      Math.abs(unroundedAmountInPaise - amountInPaise) > 1e-7 ||
      amountInPaise < 100
    ) {
      setError("Enter an amount of at least ₹1.00.")
      return
    }

    if (!window.Razorpay) {
      setError("The payment form is still loading. Please try again.")
      return
    }

    setProcessing(true)

    try {
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      })
      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Unable to create payment order.")
      }

      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "E-Cell FC",
        description: "Secure payment",
        order_id: orderData.order_id,
        handler: async (payment) => {
          try {
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            })
            const verificationData = await verificationResponse.json()

            if (!verificationResponse.ok) {
              throw new Error(verificationData.error || "Payment verification failed.")
            }

            setMessage(`Payment verified successfully. Payment ID: ${verificationData.razorpay_payment_id}`)
            setProcessing(false)
          } catch (verificationError) {
            setError(verificationError.message || "Unable to verify payment.")
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("Payment was cancelled.")
            setProcessing(false)
          },
        },
        theme: { color: "#7c3aed" },
      })

      checkout.on("payment.failed", (payment) => {
        setError(payment.error?.description || "Payment failed. Please try again.")
        setProcessing(false)
      })
      checkout.open()
    } catch (paymentError) {
      setError(paymentError.message || "Unable to start payment.")
      setProcessing(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onError={() => setError("Unable to load the payment form. Please refresh and try again.")}
      />
      <main className="min-h-screen bg-background px-4 py-16 text-foreground">
        <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Razorpay checkout</h1>
            <p className="text-sm text-muted-foreground">
              Enter an amount in rupees. The minimum payment is ₹1.00.
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="payment-amount" className="block text-sm font-medium">
                Amount (INR)
              </label>
              <input
                id="payment-amount"
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="100.00"
                className="w-full rounded-lg border border-border bg-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={!scriptReady || processing}
              className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? "Processing..." : scriptReady ? "Pay securely" : "Loading checkout..."}
            </button>
          </form>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
              {message}
            </p>
          )}
        </section>
      </main>
    </>
  )
}
