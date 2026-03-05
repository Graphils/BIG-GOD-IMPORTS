import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const { clearCart } = useCart();

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) { setStatus('failed'); return; }

    const run = async () => {
      try {
        const res = await api.get(`/payments/verify/${reference}`);
        if (res.data.verified) {
          try { await clearCart(); } catch(e) {}
          setStatus('success');
          setTimeout(() => navigate('/orders'), 3000);
        } else {
          setStatus('failed');
        }
      } catch(e) {
        console.log('Verify error:', e.message);
        setStatus('failed');
      }
    };

    run();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '40px 24px' }}>
      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-md)', padding: '60px 48px', textAlign: 'center', maxWidth: '480px', width: '100%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        {status === 'verifying' && (
          <>
            <div className="spinner" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy)', marginBottom: '12px' }}>Verifying Payment</h2>
            <p style={{ color: 'var(--text-light)' }}>Please wait while we confirm your payment...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ width: '80px', height: '80px', background: '#e8f5ee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--navy)', marginBottom: '12px' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-mid)', lineHeight: '1.7', marginBottom: '28px' }}>
              Your order has been placed. A confirmation email has been sent to you. Redirecting to your orders...
            </p>
            <Link to="/orders" className="btn btn-primary" style={{ display: 'inline-flex' }}>View My Orders</Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <div style={{ width: '80px', height: '80px', background: '#fdecea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--navy)', marginBottom: '12px' }}>Payment Failed</h2>
            <p style={{ color: 'var(--text-mid)', lineHeight: '1.7', marginBottom: '28px' }}>
              Your payment could not be verified. Please try again or contact us if you were charged.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/checkout" className="btn btn-primary">Try Again</Link>
              <Link to="/contact" className="btn btn-outline">Contact Support</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}