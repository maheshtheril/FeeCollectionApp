import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Users, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AddEnrollmentForm } from "./add-enrollment-form"

export default async function CourseDetailsPage({
  params
}: {
  params: Promise<{ orgSlug: string, courseId: string }>
}) {
  const session = await auth()
  const { orgSlug, courseId } = await params

  if (!session?.user?.id) redirect("/login")

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      organization: true,
      enrollments: {
        include: {
          student: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!course || course.organization.slug !== orgSlug) {
    redirect(`/${orgSlug}/courses`)
  }

  // Also fetch all students in the org for the enrollment dropdown
  const allStudents = await prisma.student.findMany({
    where: { organizationId: course.organizationId },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Link href={`/${orgSlug}/courses`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Courses
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{course.name}</h1>
          <div className="flex gap-4 mt-2">
            <p className="text-zinc-400">UPI ID: <span className="text-white font-mono">{course.upiId}</span></p>
            {course.billingInterval !== "ONCE" && (
              <p className="text-zinc-400">
                Billing: <span className="text-white">₹{course.baseFeeAmount} {course.billingInterval.toLowerCase()} on day {course.billingAnchorDay}</span>
              </p>
            )}
          </div>
        </div>
        <AddEnrollmentForm orgSlug={orgSlug} courseId={course.id} allStudents={allStudents} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-8">
        {course.enrollments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No students enrolled yet</h3>
            <p className="text-zinc-400 max-w-sm mx-auto">Enroll students to this course to start collecting fees.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Parent Name</th>
                  <th className="px-6 py-4 font-medium">Phone Number</th>
                  <th className="px-6 py-4 font-medium">Enrolled Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {course.enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 border border-zinc-700">
                          {enrollment.student.name.charAt(0).toUpperCase()}
                        </div>
                        {enrollment.student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {enrollment.student.parentName || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-zinc-500" />
                        {enrollment.student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 text-sm">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        enrollment.status === "ACTIVE" 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* TODO: Add unenroll button */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
