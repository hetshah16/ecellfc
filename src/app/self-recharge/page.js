"use client"

import Script from "next/script"
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"

export default function RazorpayPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [scriptReady, setScriptReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const session = await axios.get("/api/me")
        const userResponse = await axios.post("/api/user", {
          user_id: session.data.user.user_id,
        })
        setUser(userResponse.data)
      } catch (authError) {
        if ([401, 403].includes(authError.response?.status)) {
          router.replace("/login")
        } else {
          setError("Unable to load your account. Please try again.")
        }
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [router])

  async function handlePayment(event) {
    event.preventDefault()
    setError("")
    setNotice("")

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

      let paymentAttemptFinished = false
      const checkout = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "E-Cell FC",
        description: "Secure payment",
        order_id: orderData.order_id,
        handler: async (payment) => {
          paymentAttemptFinished = true
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

            if (verificationData.credited) {
              setUser((currentUser) => ({
                ...currentUser,
                coins: Number(currentUser.coins || 0) + amountInRupees,
              }))
            }
            try {
              const refreshedUser = await axios.post("/api/user", { user_id: user.user_id })
              setUser(refreshedUser.data)
            } catch (balanceError) {
              console.error("Unable to refresh balance after payment:", balanceError)
            }
            setPaymentSuccess({
              amount: amountInRupees,
              paymentId: verificationData.razorpay_payment_id,
            })
            setProcessing(false)
          } catch (verificationError) {
            setError(verificationError.message || "Unable to verify payment.")
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            if (paymentAttemptFinished) return

            setProcessing(false)
            setAmount("")
            setNotice("Recharge cancelled. You can try again.")
          },
        },
        theme: { color: "#7c3aed" },
      })

      checkout.on("payment.failed", (payment) => {
        paymentAttemptFinished = true
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
      <div className="min-h-screen bg-background text-foreground">
        {user && <Navbar coins={user.coins} user={user.name} />}
        {loadingUser ? (
          <main className="flex justify-center px-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          </main>
        ) : user ? (
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
              {paymentSuccess ? (
                <div role="status" className="space-y-5 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
                    ✓
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">Payment successful</h1>
                    <p className="text-muted-foreground">
                      ₹{paymentSuccess.amount.toFixed(2)} has been added to your E-coin balance.
                    </p>
                    <p className="text-sm text-muted-foreground">Payment ID: {paymentSuccess.paymentId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/home")}
                    className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 space-y-2">
                    <p className="text-sm font-semibold uppercase text-primary">Self recharge</p>
                    <h1 className="text-2xl font-bold">Add E-coins</h1>
                    <p className="text-sm text-muted-foreground">
                      Choose an amount to add to your balance. Minimum recharge is ₹1.00.
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
                    <p role="alert" className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  {notice && (
                    <p role="status" className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                      {notice}
                    </p>
                  )}
                </>
              )}
            </section>
          </main>
        ) : (
          <main className="mx-auto max-w-lg px-4 py-12 text-center">
            <p role="alert" className="text-destructive">{error}</p>
          </main>
        )}
      </div>
    </>
  )
}

// export default function RazorpayPage() {
// return(
//   <div>The page will be available soon</div>
// )
// }
