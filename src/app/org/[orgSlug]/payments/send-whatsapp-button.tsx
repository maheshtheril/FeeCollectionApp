"use client"

import { MessageCircle } from "lucide-react"

export function SendWhatsAppButton({ 
  studentName, 
  courseName, 
  amount, 
  phone, 
  paymentLink 
}: { 
  studentName: string, 
  courseName: string, 
  amount: number, 
  phone: string | null, 
  paymentLink: string 
}) {
  
  const handleSend = () => {
    const fullLink = `${window.location.origin}${paymentLink}`
    const text = `Hi ${studentName},\n\nYour payment of ₹${amount} for ${courseName} is due.\n\nPlease pay using this secure link:\n${fullLink}\n\nThank you!`
    const encodedText = encodeURIComponent(text)
    
    // Clean phone number (remove spaces, special chars, keep only digits)
    let phoneParam = ""
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      // Assume Indian number if no country code provided and length is 10
      phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    }

    const url = phoneParam 
      ? `https://wa.me/${phoneParam}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`

    window.open(url, '_blank')
  }

  return (
    <button
      onClick={handleSend}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-md text-xs font-bold border border-[#25D366]/20 transition-colors"
      title="Send via WhatsApp"
    >
      <MessageCircle size={14} /> Send Link
    </button>
  )
}
