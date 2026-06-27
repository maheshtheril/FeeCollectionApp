import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CheckoutClient } from "./checkout-client"

export default async function PayInvoicePage(props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    include: {
      student: {
        include: { organization: true }
      },
      enrollment: {
        include: { course: true }
      }
    }
  })

  if (!invoice) {
    return notFound()
  }

  const isPaid = invoice.status === "PAID"

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{invoice.student.organization.name}</h1>
          <p className="text-zinc-400">Payment Request</p>
        </div>

        <div className="space-y-4 mb-8 text-sm">
          <div className="flex justify-between pb-4 border-b border-zinc-800">
            <span className="text-zinc-400">Student</span>
            <span className="font-medium text-white">{invoice.student.name}</span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-800">
            <span className="text-zinc-400">Course</span>
            <span className="font-medium text-white">{invoice.enrollment?.course?.name || "General"}</span>
          </div>
          <div className="flex justify-between pb-4 border-b border-zinc-800">
            <span className="text-zinc-400">Description</span>
            <span className="font-medium text-white text-right max-w-[200px] truncate">{invoice.description}</span>
          </div>
          <div className="flex justify-between pt-2">
            <span className="text-zinc-400 text-lg">Total Amount</span>
            <span className="font-bold text-green-400 text-xl">₹{invoice.amount}</span>
          </div>
        </div>

        {isPaid ? (
          <div className="w-full py-4 text-center bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-xl">
            Payment Completed
          </div>
        ) : (
          <CheckoutClient invoiceId={invoice.id} amount={invoice.amount} />
        )}
      </div>
    </div>
  )
}
