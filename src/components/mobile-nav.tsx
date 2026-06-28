"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Users, CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react"

type MobileNavProps = {
  org: { name: string; slug: string }
  role: string
}

export function MobileNav({ org, role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeNav = () => setIsOpen(false)

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-40">
      <h2 className="text-xl font-bold tracking-tight text-white">{org.name}</h2>
      
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-md"
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeNav}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm h-full bg-zinc-950 border-r border-zinc-900 flex flex-col animate-slide-in-left">
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">{org.name}</h2>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{role}</span>
              </div>
              <button onClick={closeNav} className="text-zinc-400 hover:text-white p-2 bg-zinc-900 rounded-md">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link onClick={closeNav} href={`/org/${org.slug}/dashboard`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('dashboard') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <Link onClick={closeNav} href={`/org/${org.slug}/students`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('students') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                <Users size={20} /> Students
              </Link>
              <Link onClick={closeNav} href={`/org/${org.slug}/courses`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('courses') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                <LayoutDashboard size={20} /> Courses
              </Link>
              <Link onClick={closeNav} href={`/org/${org.slug}/payments`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('payments') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                <CreditCard size={20} /> Payments
              </Link>
              {role === "ADMIN" && (
                <>
                  <Link onClick={closeNav} href={`/org/${org.slug}/staff`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('staff') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                    <Users size={20} /> Staff
                  </Link>
                  <Link onClick={closeNav} href={`/org/${org.slug}/settings`} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname.includes('settings') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                    <Settings size={20} /> Settings
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-zinc-900">
              <Link href="/orgs" className="flex items-center justify-between w-full px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors">
                <span>Switch Org</span>
              </Link>
              <form action="/api/auth/signout" method="POST" className="w-full">
                <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-zinc-900 rounded-lg transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
