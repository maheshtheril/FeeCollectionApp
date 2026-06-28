"use client"

import { useState } from "react"
import { deleteOrDeactivateCourseAction } from "@/app/actions/course"
import { Trash2, Loader2, Ban } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteCourseButton({
  orgSlug,
  courseId,
  courseName,
  hasInvoices
}: {
  orgSlug: string,
  courseId: string,
  courseName: string,
  hasInvoices: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    const actionText = hasInvoices ? "deactivate" : "permanently delete"
    const warningText = hasInvoices 
      ? `This will hide the course and cancel all active student enrollments for this course. Past payments will be preserved.`
      : `This will completely wipe the course from the database because it has no financial history.`

    if (!window.confirm(`Are you sure you want to ${actionText} ${courseName}?\n\n${warningText}`)) {
      return
    }

    setLoading(true)

    const res = await deleteOrDeactivateCourseAction(orgSlug, courseId)
    
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else if (res?.success) {
      toast.success(res.message)
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={hasInvoices ? "Deactivate Course" : "Delete Course"}
      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : (hasInvoices ? <Ban size={16} /> : <Trash2 size={16} />)}
    </button>
  )
}
