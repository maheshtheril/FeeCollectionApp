"use client"

import { useState } from "react"
import { deleteOrDeactivateStudentAction } from "@/app/actions/student"
import { Trash2, Loader2, UserMinus } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteStudentButton({
  orgSlug,
  studentId,
  studentName,
  hasInvoices
}: {
  orgSlug: string,
  studentId: string,
  studentName: string,
  hasInvoices: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    const actionText = hasInvoices ? "deactivate" : "permanently delete"
    const warningText = hasInvoices 
      ? `This will cancel all their active enrollments and stop future billing, but preserve past payments.`
      : `This will completely wipe them from the database because they have no financial history.`

    if (!window.confirm(`Are you sure you want to ${actionText} ${studentName}?\n\n${warningText}`)) {
      return
    }

    setLoading(true)

    const res = await deleteOrDeactivateStudentAction(orgSlug, studentId)
    
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
      title={hasInvoices ? "Deactivate Student" : "Delete Student"}
      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : (hasInvoices ? <UserMinus size={16} /> : <Trash2 size={16} />)}
    </button>
  )
}
