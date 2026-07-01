import { auth, signOut } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CreateOrgModal } from "./create-org-modal"
import { LogOut, Building2, ChevronRight } from "lucide-react"

export default async function OrgsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/signin")
  }

  // Fetch the user's organizations
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

  const orgs = user?.organizations || []

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black text-white p-4 sm:p-8 selection:bg-green-500/30">
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Select Organization
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 sm:mt-2 font-medium">
              Choose a workspace to continue
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <CreateOrgModal />
            <div className="h-8 w-px bg-white/10 hidden sm:block mx-1"></div>
            <form action={async () => {
              "use server"
              await signOut()
            }}>
              <button 
                type="submit" 
                title="Sign Out"
                className="group relative p-2.5 sm:p-3 flex items-center justify-center text-red-400 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20 hover:border-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)]"
              >
                <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </form>
          </div>
        </div>
        
        {/* Organizations Grid */}
        {orgs.length === 0 ? (
          <div className="relative overflow-hidden p-12 bg-white/5 border border-white/10 rounded-3xl text-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                <Building2 className="w-10 h-10 text-zinc-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">No Organizations Yet</h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                You don't belong to any organizations right now. Create your first workspace to get started with the platform.
              </p>
              <CreateOrgModal />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((orgMember) => (
              <Link 
                key={orgMember.organization.id} 
                href={`/org/${orgMember.organization.slug}/dashboard`}
                className="group relative p-6 bg-white/5 border border-white/10 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:border-green-500/50 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.2)] overflow-hidden flex flex-col h-full"
              >
                {/* Glow Effect on Hover */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center shadow-inner text-white group-hover:from-green-500/20 group-hover:to-green-900/20 group-hover:border-green-500/30 transition-colors duration-300">
                    {orgMember.organization.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={orgMember.organization.logoUrl} alt="logo" className="w-8 h-8 object-contain rounded-lg" />
                    ) : (
                      <span className="text-xl font-bold">{orgMember.organization.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 backdrop-blur-md">
                    {orgMember.role}
                  </div>
                </div>
                
                <div className="relative z-10 flex-grow">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors duration-300 line-clamp-1">
                    {orgMember.organization.name}
                  </h3>
                  {orgMember.organization.address && (
                    <p className="text-sm text-zinc-500 line-clamp-1">
                      {orgMember.organization.address}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-300 relative z-10">
                  <span>Enter Dashboard</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
