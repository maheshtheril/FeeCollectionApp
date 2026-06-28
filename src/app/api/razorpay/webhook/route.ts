import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_webhook_secret";

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      let remainingAmountToDistribute = paymentEntity.amount / 100; // Convert from paise

      // Find all invoices associated with this order, ordered by oldest first
      const invoices = await prisma.invoice.findMany({
        where: { razorpayOrderId: orderId },
        include: { payments: true },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      for (const invoice of invoices) {
        if (remainingAmountToDistribute <= 0) break;

        const previouslyPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const invoiceRemainingBalance = Math.max(0, invoice.amount - previouslyPaid);

        if (invoiceRemainingBalance <= 0) continue;

        // How much of this invoice can we pay off?
        const amountToPayForThisInvoice = Math.min(invoiceRemainingBalance, remainingAmountToDistribute);

        // Record the transaction
        const transaction = await prisma.paymentTransaction.create({
          data: {
            invoiceId: invoice.id,
            amount: amountToPayForThisInvoice,
            paymentMethod: "RAZORPAY",
            reference: paymentId,
            notes: `Razorpay Order: ${orderId}`
          }
        });

        // Deduct from our running total
        remainingAmountToDistribute -= amountToPayForThisInvoice;

        // Check if fully paid now
        if (amountToPayForThisInvoice >= invoiceRemainingBalance) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: "PAID",
              paidAt: new Date()
            }
          });
        }
      }
      
      // TODO: Trigger Email/WhatsApp Receipt here
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
