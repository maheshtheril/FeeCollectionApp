"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const addEnrollmentSchema = z.object({
  studentId: z.string().cuid("Invalid student"),
  startDate: z.string().optional(),
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
    startDate: formData.get("startDate") as string,
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

    let today = new Date()
    if (validated.data.startDate) {
      let dateString = validated.data.startDate;
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/');
        dateString = `${year}-${month}-${day}`;
      }
      const parsedDate = new Date(dateString)
      if (!isNaN(parsedDate.getTime())) {
        today = parsedDate
      }
    }
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
        currentPeriodEnd: currentPeriodEnd,
        createdAt: today // also set createdAt so it displays correctly in UI
      }
    })

    // Create Initial Prorated Invoice if recurring AND PRE_PAY
    if (course.billingInterval !== "ONCE" && course.billingMode !== "POST_PAY" && course.baseFeeAmount > 0 && currentPeriodEnd) {
      const daysRemaining = Math.max(1, Math.ceil((currentPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
      const proratedRatio = Math.min(1, daysRemaining / 30)
      const proratedAmount = Math.round(course.baseFeeAmount * proratedRatio)

      await prisma.invoice.create({
        data: {
          studentId: validated.data.studentId,
          enrollmentId: newEnrollment.id,
          amount: proratedAmount,
          description: `Initial Prorated Fee (${daysRemaining} days)`,
          status: "OPEN",
          dueDate: new Date(today.getTime() + (course.gracePeriodDays ?? 7) * 24 * 60 * 60 * 1000), 
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

export async function editEnrollmentAction(orgSlug: string, enrollmentId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  let startDateStr = formData.get("startDate") as string
  if (!startDateStr) return { error: "Start date is required" }

  if (startDateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = startDateStr.split('/');
    startDateStr = `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(startDateStr)
  if (isNaN(parsedDate.getTime())) return { error: "Invalid date" }

  try {
    // Verify enrollment belongs to org
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            organization: {
              include: { members: { where: { userId: session.user.id } } }
            }
          }
        }
      }
    })

    if (!enrollment || enrollment.course.organization.slug !== orgSlug || enrollment.course.organization.members.length === 0) {
      return { error: "Unauthorized or not found" }
    }

    let currentPeriodEnd: Date | null = null
    if (enrollment.course.billingInterval !== "ONCE" && enrollment.course.baseFeeAmount > 0) {
      let nextBillingDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), enrollment.course.billingAnchorDay)
      if (parsedDate.getDate() >= enrollment.course.billingAnchorDay) {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      }
      currentPeriodEnd = nextBillingDate
    }

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        currentPeriodStart: parsedDate,
        currentPeriodEnd: currentPeriodEnd,
        createdAt: parsedDate
      }
    })

    revalidatePath(`/org/${orgSlug}/courses/${enrollment.courseId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update enrollment" }
  }
}

const cancelEnrollmentSchema = z.object({
  enrollmentId: z.string().cuid("Invalid enrollment"),
})

export async function cancelEnrollmentAction(orgSlug: string, courseId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

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
    enrollmentId: formData.get("enrollmentId") as string,
  }

  const validated = cancelEnrollmentSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  try {
    await prisma.enrollment.update({
      where: {
        id: validated.data.enrollmentId,
        courseId: courseId,
      },
      data: {
        status: "CANCELED"
      }
    })

    revalidatePath(`/org/${orgSlug}/courses/${courseId}`)
    revalidatePath(`/org/${orgSlug}/students`)
    return { success: true }
  } catch (error: any) {
    return { error: "Failed to cancel enrollment" }
  }
}
