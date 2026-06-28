"use client"

import { useState } from "react"
import { updateStaffAction } from "@/app/actions/staff"
import { Edit2, X } from "lucide-react"
import { toast } from "sonner"

export function EditStaffForm({ orgId, staffMember }: { orgId: string, staffMember: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setLoading(true)
    setError("")
    
    const res = await updateStaffAction(orgId, staffMember.user.id, formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
    } else if (res?.success) {
      toast.success("Staff member updated successfully!")
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-zinc-800"
        title="Edit Staff"
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Edit Staff Member</h2>
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
              
              <form id="edit-staff-form" action={clientAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={staffMember.user.name || ""}
                    placeholder="e.g. John Smith" 
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                  <input 
                    type="email" 
                    defaultValue={staffMember.user.email}
                    disabled
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                  <select 
                    name="role"
                    defaultValue={staffMember.role}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow appearance-none"
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-zinc-800 bg-zinc-900">
              <button 
                type="submit" 
                form="edit-staff-form"
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
