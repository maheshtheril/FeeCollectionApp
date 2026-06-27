import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "dummy_key_id",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
    });

    // If there is already an order, return it (to avoid creating duplicates if they retry)
    if (invoice.razorpayOrderId) {
      return NextResponse.json({ orderId: invoice.razorpayOrderId, amount: invoice.amount });
    }

    // Create a new Razorpay Order (amount is in paise)
    const options = {
      amount: Math.round(invoice.amount * 100),
      currency: "INR",
      receipt: invoice.id,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Save order ID to invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { razorpayOrderId: order.id },
    });

    return NextResponse.json({ orderId: order.id, amount: invoice.amount });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
