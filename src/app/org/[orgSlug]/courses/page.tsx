import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, ChevronRight } from "lucide-react"
import Link from "next/link"
import { CreateCourseForm } from "./create-course-form"
import { EditCourseForm } from "./[courseId]/edit-course-form"
import { DeleteCourseButton } from "./delete-course-button"

export default async function CoursesPage({
  params
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const session = await auth()
  const { orgSlug } = await params

  if (!session?.user?.id) redirect("/signin")

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug }
  })

  if (!org) redirect("/orgs")

  // Check role
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: session.user.id
      }
    }
  })
  if (!membership) redirect("/orgs")

  const isTeacher = membership.role === "TEACHER"

  // Fetch courses securely
  const courses = await prisma.course.findMany({
    where: { 
      organizationId: org.id,
      isActive: true,
      ...(isTeacher ? { teachers: { some: { id: session.user.id } } } : {})
    },
    include: {
      _count: {
        select: { enrollments: true }
      },
      teachers: true,
      enrollments: {
        include: { invoices: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch teachers for the dropdown if admin
  let teachers: any[] = []
  if (!isTeacher) {
    const staff = await prisma.organizationMember.findMany({
      where: { organizationId: org.id, role: "TEACHER" },
      include: { user: true }
    })
    teachers = staff.map(s => ({ id: s.user.id, name: s.user.name || s.user.email }))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Courses</h1>
          <p className="text-zinc-400 mt-1">Manage your fee collection courses.</p>
        </div>
        {!isTeacher && <CreateCourseForm orgSlug={org.slug} teachers={teachers} />}
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
            <div 
              key={course.id} 
              className="group p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-green-500 transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-950 rounded-xl">
                  <LayoutDashboard size={24} className="text-green-500" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded-full border border-zinc-800">
                  <span className="text-sm font-medium text-zinc-300">{course._count.enrollments} Students</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
              <p className="text-zinc-500 text-sm truncate mb-4">UPI: {course.upiId}</p>
              
              <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                <Link href={`/org/${org.slug}/courses/${course.id}`} className="text-sm font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                  View Details <ChevronRight size={16} />
                </Link>
                
                {!isTeacher && (
                  <div className="flex items-center justify-end gap-2">
                    <EditCourseForm orgSlug={org.slug} course={course} teachers={teachers} />
                    <DeleteCourseButton 
                      orgSlug={org.slug}
                      courseId={course.id}
                      courseName={course.name}
                      hasInvoices={course.enrollments.some(e => e.invoices.length > 0)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

