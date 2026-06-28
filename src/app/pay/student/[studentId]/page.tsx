import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CheckoutClient } from "./checkout-client"

export default async function PayStudentPortalPage(props: { params: Promise<{ studentId: string }> }) {
  const params = await props.params;
  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
    include: {
      organization: true,
      invoices: {
        where: { status: "OPEN" },
        include: {
          enrollment: {
            include: { course: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!student) {
    return notFound()
  }

  const openInvoices = student.invoices;
  const totalAmount = openInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{student.organization.name}</h1>
          <p className="text-zinc-400">Consolidated Statement</p>
        </div>

        <div className="space-y-4 mb-8 text-sm">
          <div className="flex justify-between pb-4 border-b border-zinc-800">
            <span className="text-zinc-400">Student</span>
            <span className="font-medium text-white">{student.name}</span>
          </div>

          <div className="py-2">
            <h3 className="text-zinc-400 mb-3 font-medium uppercase tracking-wider text-xs">Unpaid Invoices</h3>
            {openInvoices.length === 0 ? (
              <div className="text-green-400 text-center py-4 bg-green-500/10 rounded-xl">
                No outstanding balance! 🎉
              </div>
            ) : (
              <div className="space-y-3">
                {openInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between text-zinc-300 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="flex flex-col">
                      <span className="font-medium text-white text-xs">{inv.enrollment?.course?.name || "General"}</span>
                      <span className="text-xs text-zinc-500 truncate max-w-[150px]">{inv.description}</span>
                    </div>
                    <span className="font-medium">₹{inv.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {openInvoices.length > 0 && (
            <div className="flex justify-between pt-4 border-t border-zinc-800">
              <span className="text-zinc-400 text-lg">Total Amount</span>
              <span className="font-bold text-green-400 text-xl">₹{totalAmount}</span>
            </div>
          )}
        </div>

        {openInvoices.length === 0 ? (
          <div className="w-full py-4 text-center bg-zinc-800/50 border border-zinc-700 text-zinc-300 font-bold rounded-xl cursor-default">
            All Caught Up
          </div>
        ) : (
          <CheckoutClient 
            invoiceIds={openInvoices.map(inv => inv.id)} 
            totalAmount={totalAmount} 
          />
        )}
      </div>
    </div>
  )
}
