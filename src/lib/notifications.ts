import { Resend } from "resend";
import twilio from "twilio";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

export async function sendInvoiceEmail(to: string, invoiceDetails: { 
  studentName: string, 
  amount: number, 
  description: string,
  payLink: string 
}) {
  if (!resend) {
    console.warn("Resend API Key missing. Skipping email notification.");
    return;
  }

  try {
    await resend.emails.send({
      from: "FeeFlow <billing@yourdomain.com>",
      to,
      subject: `New Invoice: ${invoiceDetails.description}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>Hello, parent of ${invoiceDetails.studentName}</h2>
          <p>A new invoice has been generated for <strong>${invoiceDetails.description}</strong>.</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px;">Total Amount: <strong>₹${invoiceDetails.amount}</strong></p>
          </div>
          <a href="${invoiceDetails.payLink}" style="display: inline-block; background: #22c55e; color: black; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay Now Securely</a>
          <p style="margin-top: 30px; font-size: 12px; color: #71717a;">Powered by FeeFlow</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export async function sendWhatsAppReminder(toPhone: string, studentName: string, amount: number, payLink: string) {
  if (!twilioClient) {
    console.warn("Twilio credentials missing. Skipping WhatsApp notification.");
    return;
  }

  try {
    // Note: Twilio requires WhatsApp numbers to be formatted like 'whatsapp:+919876543210'
    const formattedTo = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:+91${toPhone.replace(/\D/g, '')}`;
    
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // e.g. 'whatsapp:+14155238886'
      to: formattedTo,
      body: `Hi! This is a reminder for ${studentName}'s fee payment of ₹${amount}. You can pay securely online here: ${payLink}`,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}
