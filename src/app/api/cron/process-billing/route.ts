import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

// This endpoint should be triggered daily at midnight by a Cron scheduler
export async function GET(request: Request) {
  // Security: In production, verify authorization headers (e.g., from Vercel Cron or a secure secret)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    const today = new Date()
    
    // Find all active enrollments with a currentPeriodEnd that is in the past or today
    const enrollmentsToBill = await prisma.enrollment.findMany({
      where: {
        status: "ACTIVE",
        currentPeriodEnd: {
          lte: today
        },
        course: {
          billingInterval: { not: "ONCE" },
          baseFeeAmount: { gt: 0 }
        }
      },
      include: {
        course: true
      }
    })

    console.log(`[Cron] Found ${enrollmentsToBill.length} enrollments ready for billing.`)

    const invoicesToCreate: any[] = []
    const enrollmentUpdates: any[] = []

    for (const enrollment of enrollmentsToBill) {
      let currentStartForLoop = enrollment.currentPeriodStart ? new Date(enrollment.currentPeriodStart) : null
      let currentPeriodEndForLoop = new Date(enrollment.currentPeriodEnd || today)
      let periodsCaughtUp = 0
      
      // Fast-forward loop to catch up on all missed billing cycles up to today
      while (currentPeriodEndForLoop <= today && periodsCaughtUp < 12) { // safety limit of 12 periods at once
        const nextEnd = new Date(currentPeriodEndForLoop)
        
        switch (enrollment.course.billingInterval) {
          case "MONTHLY":
            nextEnd.setMonth(nextEnd.getMonth() + 1)
            break
          case "QUARTERLY":
            nextEnd.setMonth(nextEnd.getMonth() + 3)
            break
          case "HALF_YEARLY":
            nextEnd.setMonth(nextEnd.getMonth() + 6)
            break
          case "YEARLY":
            nextEnd.setFullYear(nextEnd.getFullYear() + 1)
            break
        }

        let invoiceStartStr = ""
        let invoiceEndStr = ""
        let finalAmount = enrollment.course.baseFeeAmount

        if (enrollment.course.billingMode === "POST_PAY") {
          // Bill for the period that just ended
          const actualStart = currentStartForLoop || new Date(currentPeriodEndForLoop.getTime() - 30 * 24 * 60 * 60 * 1000)
          invoiceStartStr = actualStart.toLocaleDateString('en-GB')
          invoiceEndStr = currentPeriodEndForLoop.toLocaleDateString('en-GB')

          // Prorate if the period was less than 28 days (e.g. partial first month)
          const daysInPeriod = Math.max(1, Math.ceil((currentPeriodEndForLoop.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)))
          if (daysInPeriod < 28) {
            const proratedRatio = Math.min(1, daysInPeriod / 30)
            finalAmount = Math.round(enrollment.course.baseFeeAmount * proratedRatio)
          }
        } else {
          // PRE_PAY: Bill for the upcoming period
          invoiceStartStr = currentPeriodEndForLoop.toLocaleDateString('en-GB')
          invoiceEndStr = nextEnd.toLocaleDateString('en-GB')
        }

        // Prepare new invoice
        invoicesToCreate.push({
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          amount: finalAmount,
          description: `${enrollment.course.billingInterval.charAt(0) + enrollment.course.billingInterval.slice(1).toLowerCase()} Fee (${invoiceStartStr} - ${invoiceEndStr})`,
          status: "OPEN",
          dueDate: new Date(currentPeriodEndForLoop.getTime() + (enrollment.course.gracePeriodDays ?? 7) * 24 * 60 * 60 * 1000),
        })

        currentStartForLoop = new Date(currentPeriodEndForLoop)
        currentPeriodEndForLoop = new Date(nextEnd)
        periodsCaughtUp++
      }

      // Prepare enrollment update to shift their billing window forward
      enrollmentUpdates.push(
        prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            currentPeriodStart: currentStartForLoop,
            currentPeriodEnd: currentPeriodEndForLoop
          }
        })
      )
    }

    // Execute bulk operations
    if (invoicesToCreate.length > 0) {
      await prisma.invoice.createMany({
        data: invoicesToCreate
      })
      await prisma.$transaction(enrollmentUpdates)
      console.log(`[Cron] Generated ${invoicesToCreate.length} new invoices.`)
    }

    // Handle Overdue invoices
    const overdueResult = await prisma.invoice.updateMany({
      where: {
        status: "OPEN",
        dueDate: { lt: today }
      },
      data: {
        status: "OVERDUE"
      }
    })

    console.log(`[Cron] Marked ${overdueResult.count} invoices as OVERDUE.`)

    return NextResponse.json({ 
      success: true, 
      invoicesGenerated: invoicesToCreate.length,
      invoicesOverdue: overdueResult.count
    })
    
  } catch (error) {
    console.error("[Cron] Billing processing failed:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
