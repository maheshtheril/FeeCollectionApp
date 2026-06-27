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

    revalidatePath(`/${orgSlug}/students`)
    return { success: true }
  } catch (error) {
    console.error("Failed to create student:", error)
    return { error: "Internal Server Error" }
  }
}
