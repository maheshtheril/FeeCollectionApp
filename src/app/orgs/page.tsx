import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Select Organization</h1>
        
        {orgs.length === 0 ? (
          <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
            <h2 className="text-xl font-semibold mb-4">You don't belong to any organizations</h2>
            <p className="text-zinc-400 mb-6">Create one to get started.</p>
            {/* Action to create org would go here */}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orgs.map((orgMember) => (
              <Link 
                key={orgMember.organization.id} 
                href={`/org/${orgMember.organization.slug}/dashboard`}
                className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition-colors group cursor-pointer"
              >
                <h3 className="text-xl font-semibold group-hover:text-green-500 transition-colors">
                  {orgMember.organization.name}
                </h3>
                <p className="text-sm text-zinc-400 mt-2">Role: {orgMember.role}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

