import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, ChevronRight } from "lucide-react"
import Link from "next/link"
import { CreateCourseForm } from "./create-course-form"

export default async function CoursesPage({
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

  // Fetch courses securely
  const courses = await prisma.course.findMany({
    where: { organizationId: org.id },
    include: {
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
          <p className="text-zinc-400 mt-1">Manage your fee collection courses.</p>
        </div>
        <CreateCourseForm orgSlug={org.slug} />
      </div>

      {courses.length === 0 ? (
        <div className="p-12 border border-zinc-800 border-dashed rounded-3xl text-center bg-zinc-900/30">
          <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard size={32} className="text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
          <p className="text-zinc-400 max-w-sm mx-auto">Create your first course to start adding students and collecting fees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link 
              key={course.id} 
              href={`/${org.slug}/courses/${course.id}`}
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-green-500 transition-all transform hover:-translate-y-1 block"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-950 rounded-xl">
                  <LayoutDashboard size={24} className="text-green-500" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-zinc-800">
                  <span className="text-sm font-medium text-zinc-300">{course._count.enrollments} Students</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-1">{course.name}</h3>
              <p className="text-zinc-500 text-sm truncate">UPI: {course.upiId}</p>
              
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-sm text-zinc-400 group-hover:text-white transition-colors">
                <span>View Details</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

