import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div>
      <div className="page-title">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Privacy Policy</span></div>
          <h1>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '6px' }}>Last updated: March 2025</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px', padding: '48px 24px', lineHeight: '1.8', color: 'var(--text-mid)', fontSize: '15px' }}>

        <p>At <strong>BIG-GOD IMPORTS</strong>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and make purchases.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>1. Information We Collect</h2>
        <p>When you register, place an order, or contact us, we may collect the following:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Full name, email address, and phone number</li>
          <li>Delivery address (street, city, region)</li>
          <li>Order history and purchase details</li>
          <li>Payment information (processed securely by Paystack — we do not store card or MoMo details)</li>
          <li>Device type, browser, and IP address (for security purposes)</li>
        </ul>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Process and deliver your orders</li>
          <li>Send order confirmations and delivery updates by email</li>
          <li>Respond to your enquiries and customer service requests</li>
          <li>Improve our website and shopping experience</li>
          <li>Prevent fraud and ensure security</li>
        </ul>
        <p style={{ marginTop: '12px' }}>We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>3. Payment Security</h2>
        <p>All payments are processed by <strong>Paystack</strong>, a PCI DSS compliant payment provider. We do not store any card numbers, MoMo PINs, or bank account details on our servers. Your payment information is fully encrypted and handled by Paystack.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>4. Data Storage & Security</h2>
        <p>Your data is stored securely on encrypted servers. We use industry-standard security measures including HTTPS encryption, secure authentication, and restricted access to protect your information from unauthorised access.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and personal data</li>
          <li>Opt out of any marketing communications</li>
        </ul>
        <p style={{ marginTop: '12px' }}>To exercise any of these rights, contact us at <a href="mailto:biggodimports@gmail.com" style={{ color: 'var(--gold)' }}>biggodimports@gmail.com</a>.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>6. Cookies</h2>
        <p>Our website uses essential cookies to keep you logged in and maintain your shopping cart. We do not use advertising or tracking cookies. By using our website you agree to our use of essential cookies.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>7. Third Party Services</h2>
        <p>We use the following trusted third-party services to operate our store:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li><strong>Paystack</strong> — payment processing</li>
          <li><strong>Cloudinary</strong> — product image storage</li>
          <li><strong>MongoDB Atlas</strong> — secure database hosting</li>
        </ul>
        <p style={{ marginTop: '12px' }}>Each of these services has their own privacy policy and data protection measures.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>8. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.</p>

        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', fontSize: '22px', marginTop: '36px', marginBottom: '12px' }}>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
        <ul style={{ paddingLeft: '24px', marginTop: '8px' }}>
          <li>Email: <a href="mailto:biggodimports@gmail.com" style={{ color: 'var(--gold)' }}>biggodimports@gmail.com</a></li>
          <li>Phone: 0592384780</li>
          <li>WhatsApp: 0204069997</li>
        </ul>

        <div style={{ marginTop: '48px', padding: '20px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--gold)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>This Privacy Policy is governed by the laws of Ghana including the Data Protection Act, 2012 (Act 843).</p>
        </div>
      </div>
    </div>
  );
}