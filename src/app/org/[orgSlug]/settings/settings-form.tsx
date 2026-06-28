"use client"

import { useState } from "react"
import { updateOrganizationAction } from "@/app/actions/org"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SettingsForm({ org }: { org: any }) {
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(org.logoUrl || null)
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
    <form action={async (formData) => {
      setLoading(true)
      if (base64Logo) {
        formData.set("logoUrl", base64Logo)
      } else {
        // Keep existing if unchanged, or null if removed
        formData.set("logoUrl", org.logoUrl || "")
      }
      
      const res = await updateOrganizationAction(org.slug, formData)
      setLoading(false)
      if (res?.error) {
        toast.error(res.error)
      } else if (res?.success) {
        toast.success("Settings updated successfully")
        router.refresh()
      }
    }} className="space-y-6">
      
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Organization Name</label>
        <input 
          type="text" 
          name="name"
          defaultValue={org.name}
          required
          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Organization Logo</label>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Upload a logo (PNG/JPG, Max 2MB). This will appear on your PDF receipts.
        </p>
      </div>

      {logoPreview && (
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 inline-block">
          <p className="text-xs text-zinc-500 mb-2">Logo Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain" />
        </div>
      )}

      <hr className="border-zinc-800 my-4" />
      <h3 className="text-lg font-semibold text-white">Contact Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <input 
            type="email" 
            name="email"
            defaultValue={org.email || ""}
            className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Phone</label>
          <input 
            type="text" 
            name="phone"
            defaultValue={org.phone || ""}
            className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Address</label>
        <textarea 
          name="address"
          defaultValue={org.address || ""}
          rows={3}
          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white resize-none"
        />
      </div>

      <div className="pt-4 border-t border-zinc-800">
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

    </form>
  )
}
