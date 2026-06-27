import { z } from "zod"

export const createCourseSchema = z.object({
  name: z.string().min(2, "Course name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
  upiId: z.string().min(5, "UPI ID must be valid").max(50),
  customMessageTemplate: z.string().max(500).optional(),
  billingInterval: z.enum(["ONCE", "MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"]).default("ONCE"),
  baseFeeAmount: z.coerce.number().min(0, "Fee must be 0 or greater").default(0),
  billingAnchorDay: z.coerce.number().min(1).max(31).default(1),
  teacherId: z.string().optional().or(z.literal("")),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>

export const createStudentSchema = z.object({
  name: z.string().min(2, "Student name is required").max(100),
  phone: z.string().min(10, "Valid phone number is required").max(15),
  parentName: z.string().max(100).optional()
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const createEnrollmentSchema = z.object({
  studentId: z.string().cuid("Invalid student"),
  courseId: z.string().cuid("Invalid course"),
})

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
