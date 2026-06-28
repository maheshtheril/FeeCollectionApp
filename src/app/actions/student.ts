"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { createStudentSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createStudentAction(orgSlug: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Verify org membership
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { members: { where: { userId: session.user.id } } }
  })

  if (!org || org.members.length === 0) {
    return { error: "Organization not found or unauthorized" }
  }

  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    parentName: formData.get("parentName") as string || undefined,
  }

  const validated = createStudentSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await prisma.student.create({
      data: {
        ...validated.data,
        organizationId: org.id
      }
    })

    revalidatePath(`/org/${orgSlug}/students`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create student:", error)
    return { error: "Internal Server Error" }
  }
}

export async function updateStudentAction(orgSlug: string, studentId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { members: { where: { userId: session.user.id } } }
  })

  if (!org || org.members.length === 0) {
    return { error: "Organization not found or unauthorized" }
  }

  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    parentName: formData.get("parentName") as string || undefined,
  }

  const validated = createStudentSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await prisma.student.update({
      where: { id: studentId, organizationId: org.id },
      data: {
        ...validated.data,
        parentName: validated.data.parentName || null,
      }
    })

    revalidatePath(`/org/${orgSlug}/students`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update student:", error)
    return { error: "Internal Server Error" }
  }
}

export async function deleteOrDeactivateStudentAction(orgSlug: string, studentId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { members: { where: { userId: session.user.id } } }
  })

  if (!org || org.members.length === 0) {
    return { error: "Organization not found or unauthorized" }
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId, organizationId: org.id },
      include: { invoices: true }
    })

    if (!student) {
      return { error: "Student not found" }
    }

    if (student.invoices.length === 0) {
      // Hard delete if no financial history
      await prisma.student.delete({
        where: { id: studentId }
      })
      revalidatePath(`/org/${orgSlug}/students`)
      return { success: true, message: "Student deleted successfully." }
    } else {
      // Soft delete (Deactivate) if financial history exists
      await prisma.$transaction([
        prisma.student.update({
          where: { id: studentId },
          data: { isActive: false }
        }),
        prisma.enrollment.updateMany({
          where: { studentId: studentId },
          data: { status: "CANCELED" }
        })
      ])
      
      revalidatePath(`/org/${orgSlug}/students`)
      return { success: true, message: "Student deactivated successfully (past records preserved)." }
    }
  } catch (error: any) {
    console.error("Failed to delete/deactivate student:", error)
    return { error: "Failed to process request." }
  }
}
