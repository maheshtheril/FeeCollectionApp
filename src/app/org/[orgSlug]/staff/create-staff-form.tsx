"use client"

import { useState } from "react"
import { createStaff } from "@/app/actions/staff"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function CreateStaffForm({ orgId }: { orgId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.append("orgId", orgId)
      await createStaff(formData)
      toast.success("Staff member created successfully!")
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to create staff member")
      toast.error(err.message || "Failed to create staff member")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors"
      >
        + Add Staff Member
      </button>
    )
  }

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl mb-8 relative">
      <button 
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-zinc-500 hover:text-white"
      >
        ✕
      </button>
      <h2 className="text-xl font-semibold text-white mb-4">Add Staff Member</h2>
      
      {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 rounded-lg">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Name</label>
          <input name="name" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Email (Login ID)</label>
          <input name="email" type="email" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Temporary Password</label>
          <input name="password" type="password" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300">Role</label>
          <select name="role" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full px-4 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 disabled:opacity-50 ${loading ? 'cursor-wait' : ''}`}
        >
          {loading ? "Creating..." : "Create Staff"}
        </button>
      </form>
    </div>
  )
}
