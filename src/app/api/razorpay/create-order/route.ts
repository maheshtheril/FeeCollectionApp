import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId, invoiceIds } = await req.json();

    const targetInvoiceIds = invoiceIds ? invoiceIds : (invoiceId ? [invoiceId] : []);

    if (targetInvoiceIds.length === 0) {
      return NextResponse.json({ error: "Invoice ID(s) required" }, { status: 400 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { id: { in: targetInvoiceIds } },
    });

    if (invoices.length !== targetInvoiceIds.length) {
      return NextResponse.json({ error: "One or more invoices not found" }, { status: 404 });
    }

    if (invoices.some(inv => inv.status === "PAID")) {
      return NextResponse.json({ error: "One or more invoices are already paid" }, { status: 400 });
    }

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "dummy_key_id",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
    });

    // Check if ALL these invoices share the exact same razorpayOrderId (from a previous attempt)
    const existingOrderIds = new Set(invoices.map(inv => inv.razorpayOrderId).filter(Boolean));
    if (existingOrderIds.size === 1) {
      const allHaveIt = invoices.every(inv => inv.razorpayOrderId === Array.from(existingOrderIds)[0]);
      if (allHaveIt) {
         return NextResponse.json({ orderId: Array.from(existingOrderIds)[0], amount: totalAmount });
      }
    }

    // Create a new Razorpay Order (amount is in paise)
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: invoices.length > 1 ? `bulk_${invoices[0].studentId}` : invoices[0].id,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Save order ID to ALL invoices
    await prisma.invoice.updateMany({
      where: { id: { in: targetInvoiceIds } },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({ orderId: order.id, amount: totalAmount });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
