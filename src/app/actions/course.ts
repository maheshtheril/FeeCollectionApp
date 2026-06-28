"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { createCourseSchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function createCourseAction(orgSlug: string, formData: FormData) {
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
    description: formData.get("description") as string,
    upiId: formData.get("upiId") as string,
    customMessageTemplate: formData.get("customMessageTemplate") as string,
    billingMode: formData.get("billingMode") as string,
    billingInterval: formData.get("billingInterval") as string,
    baseFeeAmount: formData.get("baseFeeAmount"),
    billingAnchorDay: formData.get("billingAnchorDay"),
    gracePeriodDays: formData.get("gracePeriodDays") || "7",
    teacherIds: formData.getAll("teacherIds") as string[],
  }

  const validated = createCourseSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    const { teacherIds, ...restData } = validated.data;

    await prisma.course.create({
      data: {
        ...restData,
        description: restData.description || null,
        customMessageTemplate: restData.customMessageTemplate || null,
        organizationId: org.id,
        ...(teacherIds && teacherIds.length > 0 ? {
          teachers: {
            connect: teacherIds.map((id: string) => ({ id }))
          }
        } : {})
      }
    })

    revalidatePath(`/org/${orgSlug}/courses`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create course:", error)
    return { error: "Internal Server Error" }
  }
}

export async function updateCourseAction(orgSlug: string, courseId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    include: { members: { where: { userId: session.user.id } } }
  })

  if (!org || org.members.length === 0 || org.members[0].role !== "ADMIN") {
    return { error: "Organization not found or unauthorized" }
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    upiId: formData.get("upiId") as string,
    customMessageTemplate: formData.get("customMessageTemplate") as string,
    billingMode: formData.get("billingMode") as string,
    billingInterval: formData.get("billingInterval") as string,
    baseFeeAmount: formData.get("baseFeeAmount"),
    billingAnchorDay: formData.get("billingAnchorDay"),
    gracePeriodDays: formData.get("gracePeriodDays") || "7",
    teacherIds: formData.getAll("teacherIds") as string[],
  }

  const validated = createCourseSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    const { teacherIds, ...restData } = validated.data;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        ...restData,
        description: restData.description || null,
        customMessageTemplate: restData.customMessageTemplate || null,
        teachers: {
          set: teacherIds ? teacherIds.map((id: string) => ({ id })) : []
        }
      }
    })

    revalidatePath(`/org/${orgSlug}/courses/${courseId}`)
    revalidatePath(`/org/${orgSlug}/courses`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update course:", error)
    return { error: "Internal Server Error" }
  }
}

export async function deleteOrDeactivateCourseAction(orgSlug: string, courseId: string) {
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
    const course = await prisma.course.findUnique({
      where: { id: courseId, organizationId: org.id },
      include: { enrollments: { include: { invoices: true } } }
    })

    if (!course) {
      return { error: "Course not found" }
    }

    const totalInvoices = course.enrollments.reduce((sum, enr) => sum + enr.invoices.length, 0)

    if (totalInvoices === 0) {
      // Hard delete if no financial history tied to this course
      await prisma.course.delete({
        where: { id: courseId }
      })
      revalidatePath(`/org/${orgSlug}/courses`)
      return { success: true, message: "Course deleted successfully." }
    } else {
      // Soft delete (Deactivate) if financial history exists
      await prisma.$transaction([
        prisma.course.update({
          where: { id: courseId },
          data: { isActive: false }
        }),
        prisma.enrollment.updateMany({
          where: { courseId: courseId },
          data: { status: "CANCELED" }
        })
      ])
      
      revalidatePath(`/org/${orgSlug}/courses`)
      return { success: true, message: "Course deactivated successfully (past records preserved)." }
    }
  } catch (error: any) {
    console.error("Failed to delete/deactivate course:", error)
    return { error: "Failed to process request." }
  }
}