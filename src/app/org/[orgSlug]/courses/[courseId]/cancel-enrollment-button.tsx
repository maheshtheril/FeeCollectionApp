"use client"

import { useState } from "react"
import { cancelEnrollmentAction } from "@/app/actions/enrollment"
import { Ban, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CancelEnrollmentButton({
  orgSlug,
  courseId,
  enrollmentId,
  studentName
}: {
  orgSlug: string,
  courseId: string,
  enrollmentId: string,
  studentName: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel the enrollment for ${studentName}? This will stop all future billing for this course.`)) {
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("enrollmentId", enrollmentId)

    const res = await cancelEnrollmentAction(orgSlug, courseId, formData)
    
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else if (res?.success) {
      toast.success("Enrollment canceled successfully!")
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      title="Cancel Enrollment"
      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
    </button>
  )
}
