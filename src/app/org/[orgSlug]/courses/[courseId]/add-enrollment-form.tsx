"use client"

import { useState } from "react"
import { addEnrollmentAction } from "@/app/actions/enrollment"
import { UserPlus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AddEnrollmentForm({ 
  orgSlug, 
  courseId,
  allStudents 
}: { 
  orgSlug: string, 
  courseId: string,
  allStudents: { id: string, name: string, phone: string }[]
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
    const res = await addEnrollmentAction(orgSlug, courseId, formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
    } else if (res?.success) {
      toast.success("Student enrolled successfully!")
      setIsOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-all transform hover:scale-105"
      >
        <UserPlus size={20} /> Enroll Student
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">Add Enrollment</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
            
            <form id={`add-enrollment-form-${courseId}`} onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Content */}
              <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Select Student</label>
                  {allStudents.length === 0 ? (
                    <div className="px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 text-sm">
                      No students available. Please add a student first.
                    </div>
                  ) : (
                    <select 
                      name="studentId"
                      required
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow appearance-none"
                    >
                      <option value="">-- Choose Student --</option>
                      {allStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                  <p className="text-xs text-zinc-500 mt-1">This date is used as the anchor for future automated billing cycles.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-zinc-800 shrink-0">
                <button 
                  type="submit" 
                  disabled={loading || allStudents.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-70 text-black font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="animate-spin" size={20} />}
                  {loading ? "Adding..." : "Add Enrollment"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}
