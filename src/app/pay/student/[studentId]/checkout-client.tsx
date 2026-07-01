"use client"

import { useState } from "react"
import Script from "next/script"
import { QrCode, X } from "lucide-react"

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
        <div className="flex flex-col gap-3 mb-4">
          <button 
            onClick={() => {
              if (amountToPay <= 0 || amountToPay > totalAmount) {
                setError("Please enter a valid amount to pay")
                return
              }
              const tr = `TXN${Date.now()}`;
              // Simplified intent link without mc=0000 and cleaner tn
              const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(orgName || "Payment")}&tr=${tr}&am=${amountToPay.toFixed(2)}&cu=INR&tn=FeePayment`;
              window.location.href = upiUri;
            }}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Open UPI App (GPay, PhonePe)
          </button>
          
          <details className="w-full">
            <summary className="w-full py-3 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all cursor-pointer">
              <QrCode size={18} /> Or Show QR Code
            </summary>
            <div className="mt-3 p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
              <h3 className="text-black font-bold mb-4 text-center">Scan to Pay via UPI</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${orgName || "Payment"}&tr=TXN${Date.now()}&am=${amountToPay.toFixed(2)}&cu=INR&tn=FeePayment`)}`} 
                alt="UPI QR Code"
                className="w-48 h-48 border border-zinc-100 p-2 rounded-xl"
              />
              <p className="text-zinc-600 font-medium mt-4 text-center">Amount: ₹{amountToPay.toFixed(2)}</p>
            </div>
          </details>
        </div>
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
