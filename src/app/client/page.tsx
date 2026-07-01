"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Smartphone } from "lucide-react";

type Invoice = {
  id: string;
  amount: number;
  description: string;
  status: string;
  dueDate: string | null;
  studentId: string;
  studentName: string;
  courseName: string;
  organizationName: string;
  upiId: string;
  createdAt: string;
};

export default function ClientApp() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Dashboard
  const [payments, setPayments] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "1234") { // Hardcoded OTP for simulation
      setError("Invalid OTP. Try 1234");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
      // Fetch user's payments based on phone number
      const res = await fetch(`/api/client-payments?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
        setStep(3);
      } else {
        setError("Failed to fetch records.");
      }
    } catch (err) {
      setError("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const generateUpiLink = (payment: Invoice) => {
    const tr = `TXN${Date.now()}`;
    return `upi://pay?pa=${payment.upiId}&pn=${encodeURIComponent(payment.courseName)}&mc=0000&tr=${tr}&am=${payment.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(payment.description)}`;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1db954' }}>FeeFlow</h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px', marginTop: '8px' }}>Secure Fee Payments</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="card" style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Login to your account</h2>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '24px' }}>Enter your registered mobile number to view pending fee requests.</p>
          
          <div className="input-group">
            <label className="input-label">Mobile Number</label>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 12px' }}>
              <Smartphone size={20} color="#a0a0a0" />
              <input 
                type="tel" 
                className="input" 
                placeholder="9876543210" 
                required
                style={{ border: 'none', backgroundColor: 'transparent', flex: 1 }}
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p style={{ color: '#e57373', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
          
          <button type="submit" className="btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue'} <ArrowRight size={18} />
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="card" style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Verify your number</h2>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '24px' }}>We've sent a 4-digit code to {phone}</p>
          
          <div className="input-group">
            <label className="input-label">Enter OTP (Hint: 1234)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="••••" 
              maxLength={4}
              required
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px' }}
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
          </div>
          
          {error && <p style={{ color: '#e57373', fontSize: '14px', marginTop: '8px' }}>{error}</p>}
          
          <button type="submit" className="btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Your Dues</h2>
          
          {payments.length === 0 ? (
             <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={48} color="#1db954" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>All Clear!</h3>
                <p style={{ color: '#a0a0a0', marginTop: '8px' }}>You have no pending fee requests.</p>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {payments.map(payment => (
                <div key={payment.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{payment.courseName}</h3>
                      <p style={{ color: '#a0a0a0', fontSize: '14px', marginTop: '4px' }}>Student: {payment.studentName}</p>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ₹{payment.amount}
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                    <span style={{ color: '#a0a0a0' }}>Details:</span> {payment.description}
                  </div>
                  
                  {payment.status === 'OPEN' || payment.status === 'OVERDUE' ? (
                    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <h4 style={{ color: '#000', fontWeight: 'bold', marginBottom: '8px' }}>Scan to Pay via UPI</h4>
                      <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>Use GPay, PhonePe, Paytm, etc.</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUpiLink(payment))}`}
                        alt="UPI QR Code"
                        style={{ margin: '0 auto', width: '200px', height: '200px', border: '1px solid #eaeaea', padding: '8px', borderRadius: '12px' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1db954', padding: '14px', backgroundColor: 'rgba(29, 185, 84, 0.1)', borderRadius: '12px', fontWeight: 'bold' }}>
                      <CheckCircle size={20} /> Payment Successful
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
