import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { renderToStream } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/receipt-pdf";
import React from "react";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const { id } = await params;

    // We allow downloading if you are logged in (teacher/admin) 
    // OR if you have the secret link (future enhancement).
    // For now, let's just allow anyone with the exact transaction ID to download it.
    // Wait, the route is /invoices/[id]/pdf, but a single invoice can have MULTIPLE payments.
    // It's better if this is /transactions/[id]/pdf. Let's use the transaction ID.
    // However, if we query by transaction ID, it's safer.
    // Let's assume `id` here is the `PaymentTransaction.id`.

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            enrollment: {
              include: {
                student: true,
                course: {
                  include: {
                    organization: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!transaction || !transaction.invoice.enrollment) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const data = {
      receiptNumber: transaction.id.slice(-6).toUpperCase(),
      paymentDate: transaction.paymentDate.toLocaleDateString('en-GB'),
      orgName: transaction.invoice.enrollment.course.organization.name,
      logoUrl: transaction.invoice.enrollment.course.organization.logoUrl,
      studentName: transaction.invoice.enrollment.student.name,
      studentPhone: transaction.invoice.enrollment.student.phone,
      paymentMethod: transaction.paymentMethod,
      reference: transaction.reference,
      description: transaction.invoice.description,
      courseName: transaction.invoice.enrollment.course.name,
      amount: transaction.amount,
    };

    const stream = await renderToStream(React.createElement(ReceiptPDF, { data }));

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Receipt-${data.receiptNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
