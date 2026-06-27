import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeeFlow - Fee Collection App",
  description: "Seamlessly manage and collect fees with WhatsApp reminders and UPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-black antialiased selection:bg-green-500/30">
          {children}
        </div>
      </body>
    </html>
  );
}
