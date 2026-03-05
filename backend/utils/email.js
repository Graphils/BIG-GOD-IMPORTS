const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

const brandColor = '#1a1a2e';
const accentColor = '#c9a84c';

const emailWrapper = (content) => `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;font-family:'Georgia',serif;background:#f5f0e8;}
  .wrap{max-width:600px;margin:0 auto;background:#fff;}
  .header{background:${brandColor};padding:32px;text-align:center;}
  .header h1{color:${accentColor};font-size:28px;margin:0;letter-spacing:3px;font-weight:700;}
  .header p{color:#ccc;margin:6px 0 0;font-size:13px;letter-spacing:2px;}
  .body{padding:36px;}
  .body h2{color:${brandColor};font-size:22px;margin-top:0;}
  .body p{color:#444;line-height:1.7;font-size:15px;}
  .btn{display:inline-block;background:${accentColor};color:${brandColor};padding:14px 32px;text-decoration:none;font-weight:700;letter-spacing:1px;font-size:14px;margin:16px 0;}
  .order-table{width:100%;border-collapse:collapse;margin:20px 0;}
  .order-table th{background:${brandColor};color:${accentColor};padding:12px;text-align:left;font-size:13px;letter-spacing:1px;}
  .order-table td{padding:12px;border-bottom:1px solid #eee;color:#444;font-size:14px;}
  .total-row td{font-weight:700;color:${brandColor};background:#f9f5ee;}
  .footer{background:${brandColor};padding:24px;text-align:center;}
  .footer p{color:#888;font-size:12px;margin:4px 0;}
  .footer a{color:${accentColor};text-decoration:none;}
  .status-badge{display:inline-block;padding:6px 16px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
  .divider{height:2px;background:${accentColor};margin:24px 0;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1>BIG-GOD IMPORTS</h1>
    <p>QUALITY IMPORTS. TRUSTED DELIVERY.</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>BIG-GOD IMPORTS | Owned by Ephraim Akoto Nana Yaw</p>
    <p>Call/WhatsApp: <a href="tel:0592384780">0592384780</a> | <a href="tel:0204069997">0204069997</a></p>
    <p>Email: <a href="mailto:akotoemphraim039@gmail.com">akotoemphraim039@gmail.com</a></p>
    <p style="margin-top:12px;color:#666;">This email was sent to you because you have an account with BIG-GOD IMPORTS.</p>
  </div>
</div>
</body></html>`;

exports.sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to BIG-GOD IMPORTS, ${user.firstName || user.username}!</h2>
    <div class="divider"></div>
    <p>Thank you for creating an account with us. Your account has been successfully created.</p>
    <p>You can now:</p>
    <ul style="color:#444;line-height:2;font-size:15px;">
      <li>Browse our wide selection of quality imports</li>
      <li>Add items to your cart and wishlist</li>
      <li>Track your orders in real-time</li>
      <li>Receive exclusive offers and updates</li>
    </ul>
    <a href="${process.env.FRONTEND_URL}/shop" class="btn">START SHOPPING</a>
    <p>If you have any questions, do not hesitate to contact us.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to BIG-GOD IMPORTS',
    html: emailWrapper(content)
  });
};

exports.sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr><td>${item.name}</td><td>${item.quantity}</td><td>GHS ${(item.price * item.quantity).toFixed(2)}</td></tr>`).join('');
  const content = `
    <h2>Order Confirmed!</h2>
    <div class="divider"></div>
    <p>Dear ${user.firstName || user.username}, thank you for your order. We have received your payment and are processing your order now.</p>
    <p><strong>Order Number:</strong> <span style="color:${accentColor};font-size:18px;">${order.orderNumber}</span></p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod.replace('_',' ').toUpperCase()}</p>
    <p><strong>Payment Status:</strong> <span style="color:green;font-weight:700;">PAID</span></p>
    <table class="order-table">
      <tr><th>Item</th><th>Qty</th><th>Amount</th></tr>
      ${itemsHtml}
      <tr><td colspan="2">Shipping</td><td>GHS ${order.shippingCost.toFixed(2)}</td></tr>
      <tr class="total-row"><td colspan="2"><strong>TOTAL</strong></td><td><strong>GHS ${order.total.toFixed(2)}</strong></td></tr>
    </table>
    <p><strong>Shipping to:</strong><br>
    ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.region}</p>
    <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="btn">TRACK YOUR ORDER</a>
    <p>We will notify you once your order has been shipped.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmed - ${order.orderNumber} | BIG-GOD IMPORTS`,
    html: emailWrapper(content)
  });
};

exports.sendOrderStatusEmail = async (user, order, newStatus) => {
  const statusMessages = {
    confirmed: { title: 'Order Confirmed', msg: 'Your order has been confirmed and is being prepared.', color: '#2196F3' },
    processing: { title: 'Order Processing', msg: 'Your order is currently being processed and packed.', color: '#FF9800' },
    shipped: { title: 'Order Shipped!', msg: 'Your order is on its way! Expect delivery within 1-3 business days.', color: '#9C27B0' },
    delivered: { title: 'Order Delivered!', msg: 'Your order has been delivered. We hope you love your purchase!', color: '#4CAF50' },
    cancelled: { title: 'Order Cancelled', msg: 'Your order has been cancelled. If you did not request this, please contact us immediately.', color: '#F44336' }
  };
  const info = statusMessages[newStatus] || { title: 'Order Update', msg: 'Your order status has been updated.', color: accentColor };
  const content = `
    <h2>${info.title}</h2>
    <div class="divider"></div>
    <p>Dear ${user.firstName || user.username},</p>
    <p>${info.msg}</p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <div style="text-align:center;margin:24px 0;">
      <span class="status-badge" style="background:${info.color};color:#fff;">${newStatus.toUpperCase()}</span>
    </div>
    <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="btn">VIEW ORDER DETAILS</a>
    <p>For any enquiries, contact us via WhatsApp or phone.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `${info.title} - ${order.orderNumber} | BIG-GOD IMPORTS`,
    html: emailWrapper(content)
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const content = `
    <h2>Password Reset Request</h2>
    <div class="divider"></div>
    <p>Dear ${user.firstName || user.username}, you requested a password reset.</p>
    <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">RESET PASSWORD</a>
    <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Password Reset - BIG-GOD IMPORTS',
    html: emailWrapper(content)
  });
};

exports.sendContactNotification = async (contactData) => {
  const content = `
    <h2>New Contact Form Submission</h2>
    <div class="divider"></div>
    <p><strong>Name:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
    <p><strong>Subject:</strong> ${contactData.subject}</p>
    <p><strong>Message:</strong><br>${contactData.message}</p>`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact: ${contactData.subject} | BIG-GOD IMPORTS`,
    html: emailWrapper(content)
  });
};