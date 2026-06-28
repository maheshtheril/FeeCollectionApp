"use client"

import { useState } from "react"
import Script from "next/script"

export function CheckoutClient({ invoiceIds, totalAmount, upiId, orgName }: { invoiceIds: string[], totalAmount: number, upiId?: string | null, orgName?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [amountToPay, setAmountToPay] = useState<number>(totalAmount)

  const handlePayment = async () => {
    if (amountToPay <= 0 || amountToPay > totalAmount) {
      setError("Please enter a valid amount to pay")
      return
    }
    try {
      setLoading(true)
      setError("")
      
      // 1. Create order on our backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceIds, customAmount: amountToPay })
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || "Failed to create order")
      
      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key", 
        amount: Math.round(amountToPay * 100),
        currency: "INR",
        name: "FeeFlow Payment",
        description: `Consolidated Payment for ${invoiceIds.length} Invoice(s)`,
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

  const handleUpiPayment = () => {
    if (amountToPay <= 0 || amountToPay > totalAmount) {
      setError("Please enter a valid amount to pay")
      return
    }
    if (!upiId) return;
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(orgName || "Fee Payment")}&am=${amountToPay}&cu=INR&tn=Fee_Payment`;
    window.location.href = upiUri;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-zinc-400 mb-1">Amount to Pay Today (₹)</label>
        <input 
          type="number" 
          value={amountToPay}
          onChange={(e) => setAmountToPay(Number(e.target.value))}
          max={totalAmount}
          min={1}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" 
        />
        {amountToPay < totalAmount && (
          <p className="text-xs text-orange-400 mt-2 font-medium bg-orange-400/10 p-2 rounded">
            You are making a partial payment. The remaining balance will still be due.
          </p>
        )}
      </div>
      
      
      {upiId && (
        <button 
          onClick={handleUpiPayment}
          className="w-full mb-3 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
        >
          Open UPI App (GPay, PhonePe)
        </button>
      )}

      <button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
      >
        {loading ? "Processing..." : "Pay via Card / NetBanking"}
      </button>
      <div className="mt-4 text-center flex items-center justify-center gap-2 text-xs text-zinc-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
        </svg>
        100% Secure Payment via Razorpay
      </div>
    </>
  )
}
