"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createOrgSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  logoUrl: z.string().optional(),
})

export async function createOrganizationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const validated = createOrgSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  // Generate a unique slug
  let slug = validated.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  if (slug.endsWith('-')) slug = slug.slice(0, -1)
  
  // Ensure slug uniqueness
  let isUnique = false
  let counter = 0
  let finalSlug = slug
  
  while (!isUnique) {
    const existing = await prisma.organization.findUnique({ where: { slug: finalSlug } })
    if (existing) {
      counter++
      finalSlug = `${slug}-${counter}`
    } else {
      isUnique = true
    }
  }

  try {
    const newOrg = await prisma.organization.create({
      data: {
        name: validated.data.name,
        slug: finalSlug,
        phone: validated.data.phone,
        email: validated.data.email,
        address: validated.data.address,
        logoUrl: validated.data.logoUrl,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN"
          }
        }
      }
    })

    revalidatePath("/orgs")
    return { success: true, slug: newOrg.slug }
  } catch (error) {
    console.error("Failed to create org:", error)
    return { error: "Failed to create organization" }
  }
}

export async function updateOrganizationAction(orgSlug: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const logoUrl = formData.get("logoUrl") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" }
  }

  // Verify ownership
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { members: { where: { userId: session.user.id, role: "ADMIN" } } }
  })

  if (!org || org.members.length === 0) {
    return { error: "Unauthorized or not found" }
  }

  try {
    const updateData: any = { name }
    
    if (logoUrl) updateData.logoUrl = logoUrl
    if (phone !== null) updateData.phone = phone
    if (email !== null) updateData.email = email
    if (address !== null) updateData.address = address

    await prisma.organization.update({
      where: { slug: orgSlug },
      data: updateData
    })

    revalidatePath(`/org/${orgSlug}/settings`)
    revalidatePath(`/org/${orgSlug}/dashboard`)
    revalidatePath("/orgs")
    return { success: true }
  } catch (error) {
    return { error: "Failed to update organization" }
  }
}
