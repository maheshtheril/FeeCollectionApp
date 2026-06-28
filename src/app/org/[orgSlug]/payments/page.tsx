import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CreditCard } from "lucide-react"
import { CreatePaymentForm } from "./create-payment-form"
import { MarkPaidButton } from "./mark-paid-button"
import { SendWhatsAppButton } from "./send-whatsapp-button"
import { RunBillingEngineButton } from "./run-billing-button"
import Link from "next/link"

function getRelativeDaysText(dueDate: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return <span className="text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded-md text-xs ml-1">Overdue by {Math.abs(diffDays)} days</span>
  } else if (diffDays === 0) {
    return <span className="text-orange-400 font-bold bg-orange-400/10 px-1.5 py-0.5 rounded-md text-xs ml-1">Due Today</span>
  } else {
    return <span className="text-zinc-400 text-xs ml-1">(in {diffDays} days)</span>
  }
}

export default async function PaymentsPage({
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

  // Fetch payments securely
  const payments = await prisma.invoice.findMany({
    where: { 
      enrollment: {
        course: { 
          organizationId: org.id,
          ...(isTeacher ? { teachers: { some: { id: session.user.id } } } : {})
        }
      }
    },
    include: {
      enrollment: {
        include: { 
          student: true,
          course: true 
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch enrollments to populate the dropdown
  const enrollmentsData = await prisma.enrollment.findMany({
    where: {
      course: { 
        organizationId: org.id,
        ...(isTeacher ? { teachers: { some: { id: session.user.id } } } : {})
      },
      status: "ACTIVE"
    },
    include: { student: true, course: true }
  })

  const enrollmentOptions = enrollmentsData.map(e => ({
    id: e.id,
    name: e.student.name,
    courseName: e.course.name
  }))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Payments</h1>
          <p className="text-zinc-400 mt-1">Manage fee requests and track collection.</p>
        </div>
        {!isTeacher && (
          <div className="flex items-center gap-3">
            <RunBillingEngineButton />
            <CreatePaymentForm orgSlug={org.slug} enrollments={enrollmentOptions} />
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No payment requests</h3>
            <p className="text-zinc-400 max-w-sm mx-auto">Create your first payment request to ask for fees.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Created / Due</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-white">{payment.enrollment?.student.name || "Unknown"}</div>
                      <div className="text-xs text-zinc-500">{payment.enrollment?.student.phone || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.enrollment ? (
                        <Link href={`/org/${org.slug}/courses/${payment.enrollment.course.id}`} className="text-green-500 hover:underline">
                          {payment.enrollment.course.name}
                        </Link>
                      ) : (
                        <span className="text-zinc-500">Deleted Enrollment</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      ₹{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-zinc-400">Gen: {new Date(payment.createdAt).toLocaleDateString('en-GB')}</div>
                      {payment.dueDate && (
                        <div className="mt-1 flex items-center flex-wrap gap-1">
                          <span className="text-red-400 font-medium">Due: {new Date(payment.dueDate).toLocaleDateString('en-GB')}</span>
                          {payment.status !== "PAID" && getRelativeDaysText(payment.dueDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        {payment.status !== "PAID" && (
                          <SendWhatsAppButton 
                            studentName={payment.enrollment?.student.name || "Student"}
                            courseName={payment.enrollment?.course.name || "Course"}
                            amount={payment.amount}
                            phone={payment.enrollment?.student.phone || null}
                            paymentLink={`/pay/${payment.id}`}
                          />
                        )}
                        <MarkPaidButton orgSlug={org.slug} paymentId={payment.id} status={payment.status} />
                      </div>
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
