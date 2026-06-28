"use client"

import { useState } from "react"
import { updateOrganizationAction } from "@/app/actions/org"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SettingsForm({ org }: { org: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <form action={async (formData) => {
      setLoading(true)
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
        <label className="block text-sm font-medium text-zinc-400 mb-1">Logo URL (Optional)</label>
        <input 
          type="url" 
          name="logoUrl"
          defaultValue={org.logoUrl || ""}
          placeholder="https://example.com/logo.png"
          className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-green-500 text-white"
        />
        <p className="text-xs text-zinc-500 mt-2">
          Provide a direct link to an image (PNG/JPG). This logo will appear on your PDF receipts.
        </p>
      </div>

      {org.logoUrl && (
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 inline-block">
          <p className="text-xs text-zinc-500 mb-2">Logo Preview</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={org.logoUrl} alt="Logo Preview" className="h-16 object-contain" />
        </div>
      )}

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
