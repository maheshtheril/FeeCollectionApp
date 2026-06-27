import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
  }

  try {
    // Find all invoices for students with this phone number
    const invoices = await prisma.invoice.findMany({
      where: {
        student: {
          phone: phone
        }
      },
      include: {
        student: {
          include: {
            organization: true
          }
        },
        enrollment: {
          include: {
            course: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedData = invoices.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      description: inv.description,
      status: inv.status,
      dueDate: inv.dueDate,
      studentId: inv.student.id,
      studentName: inv.student.name,
      courseName: inv.enrollment ? inv.enrollment.course.name : "Manual Payment",
      organizationName: inv.student.organization.name,
      upiId: inv.enrollment ? inv.enrollment.course.upiId : "",
      createdAt: inv.createdAt
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Failed to fetch payments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
