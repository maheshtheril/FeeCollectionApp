"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createStaff(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const orgId = formData.get("orgId") as string
  if (!orgId) throw new Error("Missing organization ID")

  // Ensure current user is an ADMIN of this org
  const currentUserRole = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: session.user.id
      }
    }
  })

  if (currentUserRole?.role !== "ADMIN") {
    throw new Error("Only Admins can add staff")
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string // "TEACHER" or "ADMIN"

  if (!name || !email || !password || !role) {
    throw new Error("Missing required fields")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Create User and link to Organization
  await prisma.$transaction(async (tx) => {
    // 1. Create or find user (if they already exist in another org, we might just link them)
    let user = await tx.user.findUnique({ where: { email } })
    
    if (!user) {
      user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })
    } else {
      // If user exists, we don't overwrite their password unless requested, 
      // but for simplicity in this flow we assume brand new users.
      // We could throw if they already exist, but linking is better.
    }

    // 2. Link to organization
    await tx.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id
        }
      },
      update: {
        role,
      },
      create: {
        organizationId: orgId,
        userId: user.id,
        role,
      }
    })
  })

  revalidatePath(`/org`)
}
