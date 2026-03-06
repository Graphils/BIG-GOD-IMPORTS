import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
  return (
    <div>
      <div className="page-title">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Terms & Conditions</span></div>
          <h1>Terms & Conditions</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '6px' }}>Last updated: March 2025</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px', padding: '48px 24px', lineHeight: '1.8', color: 'var(--text-mid)', fontSize: '15px' }}>

        <p>Welcome to <strong>BIG-GOD IMPORTS</strong>. By accessing or using our website and placing orders, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>1. About Us</h2>
        <p>BIG-GOD IMPORTS is an e-commerce store based in Ghana, selling quality imported goods delivered across all 16 regions. We are owned and operated by Ephraim Akoto Nana Yaw.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>2. Orders & Payments</h2>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>All prices are listed in Ghana Cedis (GHS) and include applicable taxes</li>
          <li>Payment must be completed at checkout before an order is confirmed</li>
          <li>We accept Mobile Money (MTN, Vodafone, AirtelTigo), Card, and Bank Transfer via Paystack</li>
          <li>An order confirmation email will be sent after successful payment</li>
          <li>We reserve the right to cancel any order in the case of pricing errors or stock unavailability, with a full refund issued</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>3. Pre-Orders</h2>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Pre-order items are products not yet in stock but available for advance purchase</li>
          <li>Delivery cost is included in the pre-order price — no additional delivery fee applies</li>
          <li>Expected delivery dates are estimates and may change depending on supplier availability</li>
          <li>You will be notified by email of any changes to your pre-order status</li>
          <li>Pre-orders can be cancelled and fully refunded before the item ships</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>4. Delivery</h2>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>We deliver to all 16 regions of Ghana</li>
          <li>Delivery fees vary by region and are shown at checkout</li>
          <li>Delivery times vary by location — typically 1-5 business days within Greater Accra and 3-7 days for other regions</li>
          <li>You will receive email updates as your order is processed, shipped, and delivered</li>
          <li>We are not responsible for delays caused by circumstances beyond our control</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>5. Returns & Refunds</h2>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>If you receive a damaged or incorrect item, contact us within 48 hours of delivery</li>
          <li>Provide your order number and a photo of the item</li>
          <li>Approved refunds will be processed within 3-5 business days to your original payment method</li>
          <li>Items must be unused and in original condition to qualify for a return</li>
          <li>We do not accept returns for change of mind after delivery</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>6. Account Responsibility</h2>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>You are responsible for maintaining the confidentiality of your account password</li>
          <li>You must provide accurate and truthful information when registering</li>
          <li>We reserve the right to suspend accounts that violate these terms</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>7. Product Descriptions</h2>
        <p>We make every effort to display products accurately. However, colours and sizes may vary slightly due to screen settings and manufacturing. Product images are for illustration purposes.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>8. Limitation of Liability</h2>
        <p>BIG-GOD IMPORTS shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our liability is limited to the amount paid for the specific order in question.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>9. Changes to Terms</h2>
        <p>We reserve the right to update these Terms and Conditions at any time. Continued use of the website after changes constitutes acceptance of the new terms.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>10. Contact Us</h2>
        <p>For any questions regarding these Terms and Conditions:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Email: <a href="mailto:biggodimports@gmail.com" style={{ color: 'var(--gold)' }}>biggodimports@gmail.com</a></li>
          <li>Phone: 0592384780</li>
          <li>WhatsApp: 0204069997</li>
        </ul>

        <div style={{ marginTop: '48px', padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>These Terms and Conditions are governed by the laws of the Republic of Ghana.</p>
        </div>
      </div>
    </div>
  );
}