const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

const emailStyles = `
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #f5f0eb; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #1a1a1a; padding: 32px 40px; text-align: center; }
    .header h1 { color: #c9a84c; font-size: 28px; margin: 0; letter-spacing: 3px; font-weight: 400; }
    .header p { color: #999; font-size: 12px; margin: 8px 0 0; letter-spacing: 2px; text-transform: uppercase; }
    .body { padding: 40px; color: #333; line-height: 1.7; }
    .body h2 { color: #1a1a1a; font-size: 20px; font-weight: 600; }
    .highlight { background: #f9f5ee; border-left: 4px solid #c9a84c; padding: 16px 20px; margin: 20px 0; }
    .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .order-table th { background: #1a1a1a; color: #c9a84c; padding: 12px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
    .order-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row { font-weight: bold; background: #f9f5ee; }
    .btn { display: inline-block; background: #c9a84c; color: #1a1a1a; text-decoration: none; padding: 14px 32px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-size: 12px; margin: 16px 0; }
    .footer { background: #1a1a1a; padding: 24px 40px; text-align: center; }
    .footer p { color: #666; font-size: 12px; margin: 4px 0; }
    .footer a { color: #c9a84c; text-decoration: none; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 3px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
    .status-confirmed { background: #e8f5e9; color: #2e7d32; }
    .status-shipped { background: #e3f2fd; color: #1565c0; }
    .status-delivered { background: #f3e5f5; color: #6a1b9a; }
  </style>
`;

const footerHTML = `
  <div class="footer">
    <p><strong style="color:#c9a84c; letter-spacing:2px;">BIG-GOD IMPORTS</strong></p>
    <p style="color:#888;">Owned by Ephraim Akoto Nana Yaw</p>
    <p>📞 <a href="tel:0592384780">0592384780</a> | <a href="tel:0204069997">0204069997</a></p>
    <p><a href="mailto:akotoemphraim039@gmail.com">akotoemphraim039@gmail.com</a></p>
    <p style="margin-top:12px; color:#555; font-size:11px;">© 2024 BIG-GOD Imports. All rights reserved.</p>
  </div>
`;

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"BIG-GOD Imports" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<!DOCTYPE html><html><head>${emailStyles}</head><body><div class="container">${html}${footerHTML}</div></body></html>`
    });
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Welcome / Verification Email
exports.sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
    <div class="header">
      <h1>BIG-GOD IMPORTS</h1>
      <p>Premium General Merchandise</p>
    </div>
    <div class="body">
      <h2>Welcome, ${user.username}!</h2>
      <p>Thank you for creating an account with BIG-GOD Imports. You are one step away from accessing our wide selection of quality products.</p>
      <div class="highlight">
        <p>Please verify your email address to activate your account and start shopping.</p>
      </div>
      <center><a href="${url}" class="btn">Verify My Email Address</a></center>
      <p style="color:#999; font-size:12px;">This link expires in 24 hours. If you did not create this account, please ignore this email.</p>
    </div>
  `;
  return sendEmail(user.email, 'Verify Your BIG-GOD Imports Account', html);
};

// Order Confirmation Email
exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">GH₵${item.price.toFixed(2)}</td>
      <td style="text-align:right;">GH₵${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div class="header">
      <h1>BIG-GOD IMPORTS</h1>
      <p>Order Confirmation</p>
    </div>
    <div class="body">
      <h2>Your Order Has Been Placed!</h2>
      <p>Dear ${user.firstName || user.username},</p>
      <p>Thank you for your order. We have received your purchase and will begin processing it shortly.</p>
      <div class="highlight">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-confirmed">Confirmed</span></p>
      </div>
      <table class="order-table">
        <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row"><td colspan="3" style="text-align:right;">Subtotal:</td><td style="text-align:right;">GH₵${order.subtotal.toFixed(2)}</td></tr>
          <tr><td colspan="3" style="text-align:right;">Shipping:</td><td style="text-align:right;">GH₵${order.shippingFee.toFixed(2)}</td></tr>
          <tr class="total-row"><td colspan="3" style="text-align:right; font-size:16px;">TOTAL:</td><td style="text-align:right; font-size:16px; color:#c9a84c;">GH₵${order.total.toFixed(2)}</td></tr>
        </tbody>
      </table>
      <p><strong>Shipping To:</strong> ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
      <p>We will notify you when your order is shipped. If you have any questions, please contact us using the details below.</p>
    </div>
  `;
  return sendEmail(user.email, `Order Confirmed – ${order.orderNumber} | BIG-GOD Imports`, html);
};

// Delivery Confirmed Email
exports.sendDeliveryConfirmedEmail = async (user, order) => {
  const html = `
    <div class="header">
      <h1>BIG-GOD IMPORTS</h1>
      <p>Delivery Confirmed</p>
    </div>
    <div class="body">
      <h2>Your Order Has Been Delivered!</h2>
      <p>Dear ${user.firstName || user.username},</p>
      <p>We are pleased to confirm that your order <strong>${order.orderNumber}</strong> has been marked as delivered.</p>
      <div class="highlight">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>Status:</strong> <span class="status-badge status-delivered">Delivered</span></p>
      </div>
      <p>We hope you are satisfied with your purchase. If you experience any issues with your order, please do not hesitate to contact us.</p>
      <p>We would love to hear your feedback — your reviews help other customers and help us serve you better.</p>
      <p style="margin-top: 24px;"><strong>Thank you for choosing BIG-GOD Imports.</strong></p>
    </div>
  `;
  return sendEmail(user.email, `Order Delivered – ${order.orderNumber} | BIG-GOD Imports`, html);
};

// Password Reset Email
exports.sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <div class="header">
      <h1>BIG-GOD IMPORTS</h1>
      <p>Password Reset Request</p>
    </div>
    <div class="body">
      <h2>Reset Your Password</h2>
      <p>Dear ${user.username},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <center><a href="${url}" class="btn">Reset My Password</a></center>
      <div class="highlight">
        <p>This link is valid for <strong>1 hour</strong> only.</p>
        <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
      </div>
    </div>
  `;
  return sendEmail(user.email, 'Password Reset Request – BIG-GOD Imports', html);
};

// Admin notification for new order
exports.sendAdminNewOrderEmail = async (order, user) => {
  const html = `
    <div class="header">
      <h1>BIG-GOD IMPORTS</h1>
      <p>New Order Received</p>
    </div>
    <div class="body">
      <h2>New Order: ${order.orderNumber}</h2>
      <div class="highlight">
        <p><strong>Customer:</strong> ${user.firstName || ''} ${user.lastName || ''} (${user.username})</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Order Total:</strong> GH₵${order.total.toFixed(2)}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Items:</strong> ${order.items.length} item(s)</p>
      </div>
      <p>Log in to the admin panel to review and process this order.</p>
    </div>
  `;
  return sendEmail(process.env.ADMIN_EMAIL, `New Order ${order.orderNumber} – GH₵${order.total.toFixed(2)}`, html);
};
