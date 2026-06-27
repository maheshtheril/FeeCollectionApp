import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Users, Phone } from "lucide-react"
import { CreateStudentForm } from "./create-student-form"

export default async function StudentsPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const session = await auth()
  const { orgSlug } = await params

  if (!session?.user?.id) redirect("/login")

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  })

  if (!org) redirect("/orgs")

  // Fetch students securely
  const students = await prisma.student.findMany({
    where: { organizationId: org.id },
    include: {
      enrollments: {
        include: { course: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Students</h1>
          <p className="text-zinc-400 mt-1">Manage all students across your organization.</p>
        </div>
        <CreateStudentForm orgSlug={org.slug} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mt-8">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No students yet</h3>
            <p className="text-zinc-400 max-w-sm mx-auto">Add your first student to the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Parent Name</th>
                  <th className="px-6 py-4 font-medium">Phone Number</th>
                  <th className="px-6 py-4 font-medium">Enrolled Courses</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 border border-zinc-700">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {student.parentName || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-zinc-500" />
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      <div className="flex flex-wrap gap-2">
                        {student.enrollments.map(enrollment => (
                          <span key={enrollment.id} className="px-2 py-1 text-xs bg-zinc-800 rounded-md text-zinc-300">
                            {enrollment.course.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 text-sm">
                      {new Date(student.createdAt).toLocaleDateString()}
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
