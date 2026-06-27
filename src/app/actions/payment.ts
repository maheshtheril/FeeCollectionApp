"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const createPaymentSchema = z.object({
  enrollmentId: z.string().min(1, "Enrollment is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(3, "Description must be at least 3 characters").max(200),
  dueDate: z.string().optional()
})

export async function createPaymentRequestAction(orgSlug: string, formData: FormData) {
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
    enrollmentId: formData.get("enrollmentId") as string,
    amount: formData.get("amount"),
    description: formData.get("description") as string,
    dueDate: formData.get("dueDate") as string || undefined,
  }

  const validated = createPaymentSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  // Verify the enrollment belongs to this org
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: validated.data.enrollmentId },
    include: { student: true, course: true }
  })

  if (!enrollment || enrollment.course.organizationId !== org.id) {
    return { error: "Invalid enrollment selection" }
  }

  try {
    await prisma.invoice.create({
      data: {
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        amount: validated.data.amount,
        description: validated.data.description,
        dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
      }
    })

    revalidatePath(`/${orgSlug}/payments`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create invoice:", error)
    return { error: "Internal Server Error" }
  }
}

export async function markPaymentPaidAction(orgSlug: string, paymentId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  // Fast verify ownership via a nested query
  const invoice = await prisma.invoice.findUnique({
    where: { id: paymentId },
    include: {
      student: {
        include: {
          organization: {
            include: {
              members: { where: { userId: session.user.id } }
            }
          }
        }
      }
    }
  })

  if (!invoice || invoice.student.organization.members.length === 0 || invoice.student.organization.slug !== orgSlug) {
    return { error: "Unauthorized or not found" }
  }

  try {
    await prisma.invoice.update({
      where: { id: paymentId },
      data: { 
        status: "PAID",
        paidAt: new Date()
      }
    })
    
    revalidatePath(`/${orgSlug}/payments`)
    revalidatePath(`/${orgSlug}/dashboard`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to update invoice" }
  }
}
