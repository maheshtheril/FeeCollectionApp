"use client"

import { useState } from "react"
import Script from "next/script"

export function CheckoutClient({ invoiceId, amount }: { invoiceId: string, amount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError("")
      
      // 1. Create order on our backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to create order")
      
      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key", 
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "FeeFlow Payment",
        description: `Payment for Invoice #${invoiceId.slice(-6)}`,
        order_id: data.orderId,
        handler: function (response: any) {
          // Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature
          // We can optionally verify on the frontend, but the webhook handles the real update.
          window.location.reload()
        },
        theme: {
          color: "#22c55e",
        }
      }
      
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed")
      })
      
      rzp.open()
      
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}
      
      <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
      >
        {loading ? "Processing..." : "Pay Now securely"}
      </button>
      <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-zinc-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Secured by Razorpay
      </div>
    </>
  )
}
