"use client"

import { useState } from "react"
import { createCourseAction } from "@/app/actions/course"
import { Plus, X } from "lucide-react"

export function CreateCourseForm({ orgSlug, teachers = [] }: { orgSlug: string, teachers?: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'billing'>('basic')
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function clientAction(formData: FormData) {
    setLoading(true)
    setError("")
    
    const res = await createCourseAction(orgSlug, formData)
    
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
        <Plus size={20} /> Add Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            
            {/* Header - Fixed */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-white">Create New Course</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
              
            {/* Content - Scrollable */}
            <div className="p-5 overflow-y-auto no-scrollbar">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex p-1 bg-zinc-950 rounded-lg mb-6 border border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'basic' 
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'billing' 
                      ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                  }`}
                >
                  Billing Settings
                </button>
              </div>

              <form id="create-course-form" action={clientAction}>
                {/* Basic Info Tab */}
                <div className={activeTab === 'basic' ? 'block space-y-4 animate-fade-in' : 'hidden'}>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Course Name</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="e.g. Maths Class 10" 
                      required={activeTab === 'basic'}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Description (Optional)</label>
                    <textarea 
                      name="description"
                      placeholder="Description..." 
                      rows={2}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow resize-none"
                    />
                  </div>

                  {teachers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Assign Teachers (Optional)</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                        {teachers.map(t => (
                          <label key={t.id} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-900 p-2 rounded-lg transition-colors">
                            <input 
                              type="checkbox" 
                              name="teacherIds" 
                              value={t.id} 
                              className="w-4 h-4 text-green-500 bg-zinc-900 border-zinc-700 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{t.name}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">UPI ID</label>
                    <input 
                      type="text" 
                      name="upiId"
                      placeholder="e.g. teacher@upi" 
                      required={activeTab === 'basic'}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Custom Message Template</label>
                    <textarea 
                      name="customMessageTemplate"
                      placeholder="Hello, please pay your fee..." 
                      rows={2}
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow resize-none"
                    />
                  </div>
                </div>

                {/* Billing Tab */}
                <div className={activeTab === 'billing' ? 'block space-y-4 animate-fade-in' : 'hidden'}>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                    <p className="text-sm text-green-400">
                      These settings will be used to automatically generate payment requests for students enrolled in this course.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Base Fee Amount (₹)</label>
                    <input 
                      type="number" 
                      name="baseFeeAmount"
                      placeholder="0" 
                      min="0"
                      className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Billing Interval</label>
                      <select 
                        name="billingInterval"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow appearance-none"
                      >
                        <option value="ONCE">One-time / Manual</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="HALF_YEARLY">Half Yearly</option>
                        <option value="YEARLY">Yearly</option>
                      </select>
                    </div>

                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Anchor Day</label>
                      <input 
                        type="number" 
                        name="billingAnchorDay"
                        defaultValue={1}
                        min="1"
                        max="31"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-white transition-shadow"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer - Fixed */}
            <div className="p-5 border-t border-zinc-800 shrink-0">
              <button 
                type="submit" 
                form="create-course-form"
                disabled={loading}
                className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold rounded-xl transition-colors"
              >
                {loading ? "Creating..." : "Create Course"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
