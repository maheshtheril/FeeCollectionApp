"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const addEnrollmentSchema = z.object({
  studentId: z.string().cuid("Invalid student"),
})

export async function addEnrollmentAction(orgSlug: string, courseId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Verify course belongs to an org the user is a member of
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      organization: {
        include: { members: { where: { userId: session.user.id } } }
      }
    }
  })

  if (!course || course.organization.slug !== orgSlug || course.organization.members.length === 0) {
    return { error: "Organization or Course not found or unauthorized" }
  }

  const rawData = {
    studentId: formData.get("studentId") as string,
  }

  const validated = addEnrollmentSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    // Check if enrollment already exists
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: validated.data.studentId,
          courseId: course.id
        }
      }
    })

    if (existing) {
      return { error: "Student is already enrolled in this course" }
    }

    const today = new Date()
    let currentPeriodEnd: Date | null = null

    // If recurring billing is enabled, calculate proration and create initial invoice
    if (course.billingInterval !== "ONCE" && course.baseFeeAmount > 0) {
      let nextBillingDate = new Date(today.getFullYear(), today.getMonth(), course.billingAnchorDay)
      
      // If today is past the anchor day, the next billing date is next month
      if (today.getDate() >= course.billingAnchorDay) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      }
      currentPeriodEnd = nextBillingDate
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId: validated.data.studentId,
        courseId: course.id,
        currentPeriodStart: today,
        currentPeriodEnd: currentPeriodEnd
      }
    })

    // Create Initial Prorated Invoice if recurring
    if (course.billingInterval !== "ONCE" && course.baseFeeAmount > 0 && currentPeriodEnd) {
      const daysRemaining = Math.max(1, Math.ceil((currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      const proratedRatio = Math.min(1, daysRemaining / 30)
      const proratedAmount = Math.round(course.baseFeeAmount * proratedRatio)

      await prisma.invoice.create({
        data: {
          studentId: validated.data.studentId,
          enrollmentId: newEnrollment.id,
          amount: proratedAmount,
          description: `Initial Prorated Subscription Fee (${daysRemaining} days)`,
          status: "OPEN",
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        }
      })
    }

    revalidatePath(`/org/${orgSlug}/courses/${courseId}`)
    revalidatePath(`/org/${orgSlug}/courses`)
    return { success: true }
  } catch (error) {
    console.error("Failed to enroll student:", error)
    return { error: "Internal Server Error" }
  }
}

