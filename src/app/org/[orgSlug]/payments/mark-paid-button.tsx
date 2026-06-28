"use client"

import { useState } from "react"
import { markPaymentPaidAction } from "@/app/actions/payment"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function MarkPaidButton({ orgSlug, paymentId, status }: { orgSlug: string, paymentId: string, status: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (status === "PAID") {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20 cursor-default">
        <CheckCircle2 size={14} /> PAID
      </div>
    )
  }

  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        const res = await markPaymentPaidAction(orgSlug, paymentId)
        setLoading(false)
        if (res?.error) {
          toast.error(res.error)
        } else {
          toast.success("Payment marked as PAID!")
          router.refresh()
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-green-500 hover:text-black text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {loading ? "Updating..." : "Mark Paid"}
    </button>
  )
}
