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
  
  // Combobox State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState("")
  
  const filteredStudents = allStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  )

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedStudentId) {
      setError("Please select a student")
      return
    }
    
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
                    <div className="relative">
                      <input type="hidden" name="studentId" value={selectedStudentId} required />
                      
                      <div 
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus-within:ring-2 focus-within:ring-green-500 transition-shadow flex items-center justify-between cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <span className={`truncate ${selectedStudentId ? 'text-white' : 'text-zinc-500'}`}>
                          {selectedStudentId 
                            ? allStudents.find(s => s.id === selectedStudentId)?.name + " (" + allStudents.find(s => s.id === selectedStudentId)?.phone + ")"
                            : "-- Search & Choose Student --"}
                        </span>
                        <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                          <div className="p-2 border-b border-zinc-800">
                            <input
                              type="text"
                              className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-zinc-600"
                              placeholder="Search by name or phone..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto no-scrollbar">
                            {filteredStudents.length === 0 ? (
                              <div className="p-4 text-center text-zinc-500 text-sm">
                                No students found.
                              </div>
                            ) : (
                              filteredStudents.map(s => (
                                <div 
                                  key={s.id}
                                  className={`px-4 py-3 cursor-pointer hover:bg-zinc-800 transition-colors text-sm flex items-center justify-between ${selectedStudentId === s.id ? 'bg-green-500/10 text-green-400' : 'text-white'}`}
                                  onClick={() => {
                                    setSelectedStudentId(s.id)
                                    setSearchTerm("")
                                    setIsDropdownOpen(false)
                                  }}
                                >
                                  <span>{s.name} <span className="text-zinc-500 text-xs ml-1">({s.phone})</span></span>
                                  {selectedStudentId === s.id && (
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Start Date (dd/MM/yyyy)</label>
                  <input 
                    type="text" 
                    name="startDate"
                    placeholder="dd/MM/yyyy"
                    pattern="\d{2}/\d{2}/\d{4}"
                    title="Please enter date in dd/MM/yyyy format"
                    defaultValue={(() => {
                      const today = new Date();
                      return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
                    })()}
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
