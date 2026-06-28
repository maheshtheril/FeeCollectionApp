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

export async function updateStaffAction(orgId: string, targetUserId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const currentUserRole = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: session.user.id
      }
    }
  })

  if (currentUserRole?.role !== "ADMIN") {
    return { error: "Only Admins can update staff" }
  }

  const name = formData.get("name") as string
  const role = formData.get("role") as string // "TEACHER" or "ADMIN"

  if (!name || !role) {
    return { error: "Missing required fields" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Check if we are demoting an admin
      if (role === "TEACHER") {
        const targetMember = await tx.organizationMember.findUnique({
          where: { organizationId_userId: { organizationId: orgId, userId: targetUserId } }
        })
        
        if (targetMember?.role === "ADMIN") {
          const adminCount = await tx.organizationMember.count({
            where: { organizationId: orgId, role: "ADMIN" }
          })
          if (adminCount <= 1) {
            throw new Error("Cannot demote the only remaining Admin.")
          }
        }
      }

      const userUpdateData: any = { name }
      
      if (password && password.trim().length > 0) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters")
        userUpdateData.password = await bcrypt.hash(password, 10)
      }

      await tx.user.update({
        where: { id: targetUserId },
        data: userUpdateData
      })

      await tx.organizationMember.update({
        where: {
          organizationId_userId: {
            organizationId: orgId,
            userId: targetUserId
          }
        },
        data: { role }
      })
    })

    revalidatePath(`/org/${orgId}/staff`)
    revalidatePath(`/orgs`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update staff" }
  }
}
