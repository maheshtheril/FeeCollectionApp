import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail, sendWhatsAppReminder } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    // Verify cron secret if configured to secure this endpoint
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    
    // Find enrollments that are active and need an invoice generated
    // This is a simplified billing logic. In a real world scenario, 
    // you would check the billingAnchorDay and billingInterval to see if today is the day to bill.
    
    const activeEnrollments = await prisma.enrollment.findMany({
      where: { status: "ACTIVE" },
      include: { course: true, student: true }
    });

    const generatedInvoices = [];

    for (const enrollment of activeEnrollments) {
      // Simplified: If it's the anchor day, generate a monthly invoice
      // Note: A robust system tracks currentPeriodEnd to avoid duplicates
      if (today.getDate() === enrollment.course.billingAnchorDay) {
        
        // Check if we already generated an invoice for this enrollment this month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            enrollmentId: enrollment.id,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        if (!existingInvoice) {
          const invoice = await prisma.invoice.create({
            data: {
              amount: enrollment.course.baseFeeAmount,
              description: `${enrollment.course.name} - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })} Fee`,
              studentId: enrollment.studentId,
              enrollmentId: enrollment.id,
              dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7), // 7 days to pay
              status: "OPEN"
            }
          });
          
          // Send Notifications (non-blocking)
          const payLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${invoice.id}`;
          
          if (enrollment.student.email) {
            sendInvoiceEmail(enrollment.student.email, {
              studentName: enrollment.student.name,
              amount: invoice.amount,
              description: invoice.description,
              payLink
            });
          }
          
          if (enrollment.student.phone) {
            sendWhatsAppReminder(enrollment.student.phone, enrollment.student.name, invoice.amount, payLink);
          }

          generatedInvoices.push(invoice);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      generated: generatedInvoices.length,
      invoices: generatedInvoices 
    });

  } catch (error: any) {
    console.error("Cron Billing Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
