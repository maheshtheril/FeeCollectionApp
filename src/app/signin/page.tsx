"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { loginAction } from "./actions"

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")
  const initialError = errorParam === "credentials" ? "Invalid email or password" : errorParam === "default" ? "An error occurred during sign in" : null
  
  const [error, setError] = useState<string | null>(initialError)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await loginAction(null, formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = "/orgs"
      }
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT") {
        // Successful login redirects
        window.location.href = "/orgs"
        return
      }
      setError("Failed to sign in. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-md p-10 space-y-8 bg-zinc-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 mb-2 transform transition hover:scale-105 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm font-medium text-zinc-400">Enter your details to access your account</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-zinc-300 ml-1" htmlFor="email">Email address</label>
            <div className="relative group/input">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-5 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-white placeholder-zinc-500 transition-all duration-300"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-sm font-semibold text-zinc-300" htmlFor="password">Password</label>
              <a href="#" className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors">Forgot password?</a>
            </div>
            <div className="relative group/input">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-5 py-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none text-white placeholder-zinc-500 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full overflow-hidden px-5 py-3.5 mt-2 text-sm font-bold text-black bg-white rounded-xl group/btn hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300 disabled:opacity-70"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 opacity-90 transition-opacity duration-300 group-hover/btn:opacity-100"></span>
            <span className="relative flex items-center justify-center gap-2">
              {loading ? "Signing in..." : "Sign In"}
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
