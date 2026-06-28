"use client"

import { useState } from "react"
import { Play, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RunBillingEngineButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRun = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/cron/process-billing")
      if (res.ok) {
        toast.success("Billing Engine completed successfully!")
        router.refresh()
      } else {
        toast.error("Failed to run billing engine")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleRun}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 font-bold rounded-lg transition-all"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
      {loading ? "Running Engine..." : "Run Billing Engine"}
    </button>
  )
}
