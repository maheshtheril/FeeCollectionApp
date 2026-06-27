"use client"

import { useState } from "react"
import { markPaymentPaidAction } from "@/app/actions/payment"
import { CheckCircle2 } from "lucide-react"

export function MarkPaidButton({ orgSlug, paymentId, status }: { orgSlug: string, paymentId: string, status: string }) {
  const [loading, setLoading] = useState(false)

  if (status === "PAID") {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20 cursor-default">
        <CheckCircle2 size={14} /> PAID
      </div>
    )
  }

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await markPaymentPaidAction(orgSlug, paymentId)
        setLoading(false)
      }}
      className="px-4 py-2 bg-zinc-800 hover:bg-green-500 hover:text-black text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "Updating..." : "Mark Paid"}
    </button>
  )
}
