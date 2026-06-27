"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" }
    })

    if (res.ok) {
      router.push("/login")
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">Create an Account</h1>
          <p className="mt-2 text-sm text-zinc-400">Set up your organization</p>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300" htmlFor="name">Your Name</label>
            <input id="name" name="name" type="text" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300" htmlFor="orgName">Organization Name</label>
            <input id="orgName" name="orgName" type="text" required className="w-full px-4 py-2 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-white" placeholder="e.g. Acme Corp" />
          </div>
          <button type="submit" className="w-full px-4 py-2 text-sm font-bold text-black bg-green-500 rounded-lg hover:bg-green-400 transition-colors">
            Register
          </button>
        </form>
      </div>
    </div>
  )
}
