"use client"

import { useState } from "react"
import { updateStudentAction } from "@/app/actions/student"
import { Edit2, X } from "lucide-react"
import { toast } from "sonner"

export function EditStudentForm({ orgSlug, student }: { orgSlug: string, student: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setLoading(true)
    setError("")
    
    const res = await updateStudentAction(orgSlug, student.id, formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
    } else if (res?.success) {
      toast.success("Student updated successfully!")
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800"
        title="Edit Student"
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Edit Student</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
              
            <div className="p-5">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form id="edit-student-form" action={clientAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Student Name</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={student.name}
                    placeholder="e.g. John Doe" 
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    defaultValue={student.phone}
                    placeholder="e.g. 9876543210" 
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Parent/Guardian Name (Optional)</label>
                  <input 
                    type="text" 
                    name="parentName"
                    defaultValue={student.parentName || ""}
                    placeholder="e.g. Robert Doe" 
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-zinc-800 bg-zinc-900">
              <button 
                type="submit" 
                form="edit-student-form"
                disabled={loading}
                className={`w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-xl transition-colors ${loading ? 'cursor-wait' : ''}`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
