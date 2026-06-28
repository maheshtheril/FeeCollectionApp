"use client"

import { useState } from "react"
import { recordManualPaymentAction } from "@/app/actions/payment"
import { CheckCircle2, Loader2, IndianRupee, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function RecordPaymentModal({ 
  orgSlug, 
  invoice 
}: { 
  orgSlug: string, 
  invoice: any
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const totalPaid = invoice.payments ? invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0) : 0
  const amountRemaining = Math.max(0, invoice.amount - totalPaid)

  if (invoice.status === "PAID") {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20 cursor-default">
        <CheckCircle2 size={14} /> PAID
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-green-500 hover:text-black text-white text-xs font-bold rounded-lg transition-colors"
      >
        Record Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Record Offline Payment</h2>
            <p className="text-sm text-zinc-400 mb-6">Enter the payment details for {invoice.description}</p>
            
            <form action={async (formData) => {
              setLoading(true)
              const res = await recordManualPaymentAction(orgSlug, formData)
              setLoading(false)
              if (res?.error) {
                toast.error(res.error)
              } else {
                toast.success("Payment recorded successfully!")
                setIsOpen(false)
                router.refresh()
              }
            }} className="space-y-4">
              <input type="hidden" name="invoiceId" value={invoice.id} />
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Amount Paid (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="number" 
                    name="amount" 
                    step="0.01"
                    defaultValue={amountRemaining}
                    max={amountRemaining}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Remaining balance: ₹{amountRemaining}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Payment Method</label>
                <select name="paymentMethod" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50">
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Payment Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="date" 
                    name="paymentDate" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Reference (Optional)</label>
                <input 
                  type="text" 
                  name="reference" 
                  placeholder="Cheque number or UTR"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Saving..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
