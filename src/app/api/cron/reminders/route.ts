import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function GET(req: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDateIn3Days = new Date(today);
    targetDateIn3Days.setDate(today.getDate() + 3);

    const targetDateYesterday = new Date(today);
    targetDateYesterday.setDate(today.getDate() - 1);

    // Find invoices that are OPEN or OVERDUE
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["OPEN", "OVERDUE"] },
        dueDate: { not: null },
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: { include: { organization: true } }
          }
        },
        payments: true
      }
    });

    let emailsSent = 0;
    let smsSent = 0; // Skeleton for Twilio

    for (const inv of invoices) {
      if (!inv.dueDate) continue;

      const dueDate = new Date(inv.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      // We send reminders 3 days before, and 1 day after it's overdue.
      const isDueIn3Days = dueDate.getTime() === targetDateIn3Days.getTime();
      const isOverdueBy1Day = dueDate.getTime() === targetDateYesterday.getTime();

      if (!isDueIn3Days && !isOverdueBy1Day) continue;

      const previouslyPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Math.max(0, inv.amount - previouslyPaid);

      if (remainingBalance <= 0) continue;

      const student = inv.enrollment?.student;
      if (!student) continue;

      const orgName = inv.enrollment?.course.organization.name || "The Organization";
      const paymentLink = `https://${req.headers.get("host")}/pay/student/${student.id}`;

      const subject = isDueIn3Days 
        ? `Upcoming Fee Reminder from ${orgName}` 
        : `OVERDUE: Fee Payment Required for ${orgName}`;
      
      const message = `
        Dear ${student.parentName || student.name},
        
        This is a polite reminder regarding a fee of Rs. ${remainingBalance} for ${inv.description}.
        ${isDueIn3Days ? "This is due in 3 days." : "This payment is now OVERDUE."}
        
        You can pay instantly using UPI, Credit Card, or Net Banking by clicking the link below:
        ${paymentLink}
        
        Thank you,
        ${orgName}
      `;

      // 1. Send Email if email exists
      if (student.email) {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'FeeFlow <onboarding@resend.dev>',
            to: [student.email], // Note: Resend free tier only allows emailing the verified email
            subject: subject,
            text: message,
          });
        } else {
          console.log("[Mock Email] Sent to:", student.email);
          console.log(message);
        }
        emailsSent++;
      }

      // 2. Send SMS if phone exists (Twilio Skeleton)
      if (student.phone && process.env.TWILIO_ACCOUNT_SID) {
        // const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        // await client.messages.create({
        //   body: message,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: student.phone
        // });
        smsSent++;
      }
    }

    return NextResponse.json({ 
      status: "success", 
      message: `Processed reminders. Emails sent: ${emailsSent}, SMS sent: ${smsSent}` 
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
