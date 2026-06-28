"use client"

import { useState } from "react"
import { createOrganizationAction } from "@/app/actions/org"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateOrgModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [base64Logo, setBase64Logo] = useState<string>("")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large (Max 2MB)")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const b64 = reader.result as string
        setLogoPreview(b64)
        setBase64Logo(b64)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors"
      >
        <Plus size={18} />
        New Organization
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Organization</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form action={async (formData) => {
              setLoading(true)
              if (base64Logo) {
                formData.set("logoUrl", base64Logo)
              }
              const res = await createOrganizationAction(formData)
              setLoading(false)
              if (res?.error) {
                toast.error(res.error)
              } else if (res?.success) {
                toast.success("Organization created!")
                setIsOpen(false)
                router.push(`/org/${res.slug}/dashboard`)
              }
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Organization Name *</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. Acme Institute"
                  required
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Organization Logo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                />
              </div>
              
              {logoPreview && (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo Preview" className="h-12 object-contain" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="contact@acme.com"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone (Optional)</label>
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Address (Optional)</label>
                <textarea 
                  name="address"
                  placeholder="123 Education Street, City"
                  rows={2}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
