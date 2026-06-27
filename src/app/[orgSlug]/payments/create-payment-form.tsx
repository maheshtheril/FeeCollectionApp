"use client"

import { useState } from "react"
import { createPaymentRequestAction } from "@/app/actions/payment"
import { Plus, X } from "lucide-react"

type EnrollmentOption = {
  id: string
  name: string
  courseName: string
}

export function CreatePaymentForm({ orgSlug, enrollments }: { orgSlug: string, enrollments: EnrollmentOption[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setLoading(true)
    setError("")
    
    const res = await createPaymentRequestAction(orgSlug, formData)
    
    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg transition-all transform hover:scale-105"
      >
        <Plus size={20} /> Request Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">Request Payment</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5 overflow-y-auto no-scrollbar">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form id="create-payment-form" action={clientAction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Select Student & Course</label>
                  <select 
                    name="enrollmentId"
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow appearance-none"
                  >
                    <option value="">Select an enrollment...</option>
                    {enrollments.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.courseName})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount"
                    placeholder="500" 
                    required
                    min="1"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                  <input 
                    type="text" 
                    name="description"
                    placeholder="e.g. October Tuition Fee" 
                    required
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    name="dueDate"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-zinc-800 shrink-0">
              <button 
                type="submit" 
                form="create-payment-form"
                disabled={loading}
                className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-xl transition-colors"
              >
                {loading ? "Sending..." : "Send Request"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
