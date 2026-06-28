"use client"

import { useState } from "react"
import { editEnrollmentAction } from "@/app/actions/enrollment"
import { CalendarIcon, X, Loader2, Edit } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function EditEnrollmentForm({ 
  orgSlug, 
  enrollmentId,
  currentStartDate
}: { 
  orgSlug: string, 
  enrollmentId: string,
  currentStartDate: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const res = await editEnrollmentAction(orgSlug, enrollmentId, formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
    } else if (res?.success) {
      toast.success("Enrolled date updated successfully!")
      setIsOpen(false)
      router.refresh()
    }
  }

  // Convert current ISO date to YYYY-MM-DD for the date picker
  const formattedDate = new Date(currentStartDate).toISOString().split('T')[0]

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
        title="Edit Start Date"
      >
        <Edit size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon size={20} className="text-green-500" /> Edit Date
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <form id={`edit-enrollment-form-${enrollmentId}`} onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Content */}
              <div className="p-5 space-y-4">
                {error && (
                  <div className="mb-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">New Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    defaultValue={formattedDate}
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    Changing this updates the enrollment record's start date, but will not automatically recalculate past prorated invoices.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-800 shrink-0 bg-zinc-950/50 rounded-b-2xl">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-70 text-black font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="animate-spin" size={20} />}
                  {loading ? "Saving..." : "Save Date"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}
