import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const session = await auth()
  const { orgSlug } = await params

  if (!session?.user?.id) redirect("/signin")

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  })

  if (!org) redirect("/orgs")

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: session.user.id
      }
    }
  })

  if (membership?.role !== "ADMIN") {
    redirect(`/org/${org.slug}/dashboard`)
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Organization Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your organization's public details and branding.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <SettingsForm org={org} />
      </div>
    </div>
  )
}
