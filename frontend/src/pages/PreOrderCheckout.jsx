import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Checkout.css';

const REGIONS = ['Greater Accra','Ashanti','Western','Central','Eastern','Northern','Upper East','Upper West','Volta','Brong-Ahafo','North East','Savannah','Oti','Bono East','Ahafo','Western North'];

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard' },
  { id: 'mobile_money', label: 'Mobile Money', icon: '📱', desc: 'MTN, Vodafone, AirtelTigo' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', desc: 'Access Bank Ghana' },
];

export default function PreOrderCheckout() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    firstName: user?.firstName || '', lastName: user?.lastName || '',
    phone: user?.phone || '', street: user?.address?.street || '',
    city: user?.address?.city || '', region: '',
    country: 'Ghana', postalCode: ''
  });

  const items = cart?.items?.filter(i => i.product) || [];

  useEffect(() => {
    if (!items.length) navigate('/cart');
  }, [items.length]);

  const handleAddressChange = e => {
    const { name, value } = e.target;
    setAddress(a => ({ ...a, [name]: value }));
  };

  const validateAddress = () => {
    if (!address.firstName || !address.lastName || !address.phone || !address.street || !address.city || !address.region)
      return 'Please fill in all required fields.';
    return null;
  };

  const handlePaystack = async () => {
    const err = validateAddress();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const initRes = await api.post('/payments/initialize', {
        amount: cartTotal,
        email: user.email,
        paymentMethod,
        orderData: {
          items: items.map(i => ({ product: i.product._id, quantity: i.quantity })),
          shippingAddress: address,
          paymentMethod,
          shippingCost: 0
        },
        callbackUrl: `${window.location.origin}/payment/callback`
      });
      const { authorization_url } = initRes.data.data;
      window.location.href = authorization_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-title">
        <div className="container">
          <h1>Pre-Order Checkout</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '6px' }}>
            Complete your pre-order — delivery is included in the price.
          </p>
        </div>
      </div>

      {/* Pre-order notice */}
      <div style={{ background: '#f3e5f5', borderBottom: '1px solid #ce93d8', padding: '12px 0' }}>
        <div className="container">
          <p style={{ fontSize: '13px', color: '#6a1b9a', fontWeight: '600' }}>
            📦 Pre-Order — Pay now and your item will be shipped to you once it arrives in stock. You'll be notified by email.
          </p>
        </div>
      </div>

      <div className="container checkout-layout">
        <div className="checkout-form">
          <div className="checkout-section">
            <h2>Delivery Information</h2>
            <div className="form-row">
              <div className="form-group"><label>First Name *</label><input name="firstName" value={address.firstName} onChange={handleAddressChange} required /></div>
              <div className="form-group"><label>Last Name *</label><input name="lastName" value={address.lastName} onChange={handleAddressChange} required /></div>
            </div>
            <div className="form-group"><label>Phone Number *</label><input name="phone" type="tel" value={address.phone} onChange={handleAddressChange} required /></div>
            <div className="form-group"><label>Street Address *</label><input name="street" value={address.street} onChange={handleAddressChange} placeholder="House number, street name" required /></div>
            <div className="form-row">
              <div className="form-group"><label>City *</label><input name="city" value={address.city} onChange={handleAddressChange} required /></div>
              <div className="form-group">
                <label>Region *</label>
                <select name="region" value={address.region} onChange={handleAddressChange} required>
                  <option value="">Select region</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`payment-option${paymentMethod === m.id ? ' selected' : ''}`}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                  <div className="payment-option-content">
                    <span className="payment-option-label">{m.label}</span>
                    <span className="payment-option-desc">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secured by Paystack. Your payment information is encrypted and safe.
            </p>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {items.map(item => (
              <div key={item.product._id} className="order-item-row">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {item.product.images?.[0]?.url && (
                    <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                  )}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--navy)' }}>{item.product.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Qty: {item.quantity}</p>
                    {item.product.expectedDate && (
                      <p style={{ fontSize: '11px', color: '#6a1b9a', fontWeight: '600' }}>Est: {item.product.expectedDate}</p>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>GHS {(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row">
            <span>Subtotal</span><span>GHS {cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span style={{ color: '#6a1b9a', fontWeight: '700' }}>Included</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total">
            <span>Total</span><span>GHS {cartTotal.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-gold"
            style={{ width: '100%', marginTop: '24px', padding: '16px' }}
            onClick={handlePaystack}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pre-Order — Pay GHS ${cartTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}