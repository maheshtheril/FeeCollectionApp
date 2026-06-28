import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { CreateStaffForm } from "./create-staff-form"
import { EditStaffForm } from "./edit-staff-form"

export default async function StaffPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const organization = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  })
  if (!organization) notFound()

  // Ensure user is an ADMIN to view the Staff page
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: session.user.id
      }
    }
  })

  if (!membership || membership.role !== "ADMIN") {
    redirect(`/org/${orgSlug}/dashboard`)
  }

  const staffMembers = await prisma.organizationMember.findMany({
    where: { organizationId: organization.id },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Staff Management</h1>
          <p className="text-zinc-400">Manage teachers and administrators</p>
        </div>
      </div>

      <CreateStaffForm orgId={organization.id} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Joined</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {staffMembers.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{member.user.name || "Unknown"}</td>
                <td className="px-6 py-4">{member.user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    member.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(member.createdAt).toLocaleDateString('en-GB')}</td>
                <td className="px-6 py-4 text-right">
                  <EditStaffForm orgId={organization.id} staffMember={member} />
                </td>
              </tr>
            ))}
            {staffMembers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
