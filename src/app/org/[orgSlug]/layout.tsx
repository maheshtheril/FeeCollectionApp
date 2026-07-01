import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, CreditCard, LayoutDashboard, LogOut, Settings } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const session = await auth()
  const { orgSlug } = await params

  if (!session?.user?.id) {
    redirect("/signin")
  }

  // Verify the user belongs to this organization
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    }
  })

  const currentOrgMembership = user?.organizations.find(
    (org) => org.organization.slug === orgSlug
  )

  if (!currentOrgMembership) {
    // User doesn't belong to this org, or it doesn't exist.
    redirect("/orgs")
  }

  const org = currentOrgMembership.organization

  return (
    <div className="flex h-screen bg-black text-white flex-col md:flex-row">
      <MobileNav org={org} role={currentOrgMembership.role} />
      
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-900 flex-col">
        <div className="p-6 border-b border-zinc-900">
          <div className="flex items-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="FeeFlow" className="w-8 h-8 object-contain" />
            <h2 className="text-xl font-bold tracking-tight">{org.name}</h2>
          </div>
          <span className="text-xs text-zinc-500 uppercase tracking-wider block">{currentOrgMembership.role}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/org/${org.slug}/dashboard`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link href={`/org/${org.slug}/students`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
            <Users size={20} /> Students
          </Link>
          <Link href={`/org/${org.slug}/courses`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
            <LayoutDashboard size={20} /> Courses
          </Link>
          <Link href={`/org/${org.slug}/payments`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
            <CreditCard size={20} /> Payments
          </Link>
          {currentOrgMembership.role === "ADMIN" && (
            <>
              <Link href={`/org/${org.slug}/staff`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
                <Users size={20} /> Staff
              </Link>
              <Link href={`/org/${org.slug}/settings`} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 transition-colors text-zinc-300 hover:text-white">
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
