# BIG-GOD IMPORTS — Full-Stack E-Commerce Platform

A professional, production-ready e-commerce web application built for BIG-GOD IMPORTS, owned by **Ephraim Akoto Nana Yaw**.

---

## Overview

BIG-GOD IMPORTS is a full-featured online store serving customers across Ghana. Built with React (frontend) and Node.js/Express (backend), with MongoDB as the database. Payments are processed securely via **Paystack**, supporting card, mobile money, and bank transfer.

---

## Features

### Customer-Facing
- **Registration / Login** — Email + username + password. reCAPTCHA v2 on all auth forms.
- **Product Browsing** — Search, filter by category, price range, stock availability. Sort by price, rating, popularity.
- **Product Details** — Image gallery, stock status, ratings, customer reviews.
- **Shopping Cart** — Add, update, remove items. Synced to backend.
- **Wishlist / Favourites** — Save products for later.
- **Checkout** — Full shipping address form with Ghana regions. Three payment options.
- **Paystack Payments** — Card, Mobile Money (MTN, Vodafone, AirtelTigo), Bank Transfer.
- **Order Tracking** — Visual progress tracker (Pending → Confirmed → Processing → Shipped → Delivered).
- **Email Notifications** — Welcome email, order confirmation, order status updates, password reset.
- **Contact Page** — Send enquiries via form, phone, WhatsApp, or email.
- **Forgot/Reset Password** — Secure token-based password reset via email.
- **Mobile Responsive** — Fully responsive across all screen sizes.

### Admin Panel (`/admin`)
- **Dashboard** — Revenue, order count, product count, customer count. Recent orders and low-stock alerts.
- **Product Management** — Add products with real images (Cloudinary), edit, update stock, deactivate.
- **Order Management** — View all orders, update status (triggers customer email notification), view full order details.
- **Customer Management** — View all registered customers.

### Security
- **reCAPTCHA v2** on login and registration
- **JWT authentication** with 7-day expiry
- **Rate limiting** — 200 req/15min general, 10 req/15min on auth endpoints
- **Helmet.js** security headers
- **bcryptjs** password hashing (12 rounds)
- **Input validation** throughout
- **CORS** restricted to configured frontend URL

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Vite, Axios |
| Styling | Pure CSS with CSS Variables (no UI library) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (jsonwebtoken) |
| Payments | Paystack |
| Image Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, express-rate-limit, reCAPTCHA v2, bcryptjs |
| File Upload | Multer (memory storage → Cloudinary) |

---

## Project Structure

```
biggod-imports/
├── backend/
│   ├── controllers/         # Route handlers (modular)
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Wishlist.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js          # Register, login, forgot/reset password
│   │   ├── products.js      # Public product endpoints
│   │   ├── orders.js        # User orders
│   │   ├── cart.js          # Cart management
│   │   ├── wishlist.js      # Wishlist toggle
│   │   ├── payments.js      # Paystack init + verify + webhook
│   │   ├── admin.js         # All admin endpoints (protected)
│   │   ├── contact.js       # Contact form
│   │   └── reviews.js       # Product reviews
│   ├── utils/
│   │   ├── email.js         # Nodemailer email templates
│   │   └── cloudinary.js    # Image upload helpers
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   └── product/
    │   │       └── ProductCard.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Shop.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── PaymentCallback.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Orders.jsx
    │   │   ├── OrderDetail.jsx
    │   │   ├── Wishlist.jsx
    │   │   ├── Contact.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── Products.jsx
    │   │       ├── Orders.jsx
    │   │       └── Users.jsx
    │   ├── styles/
    │   │   └── global.css
    │   └── utils/
    │       └── api.js       # Axios instance with JWT interceptor
    ├── index.html
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Paystack account (Ghana)
- Gmail account with App Password enabled
- Google reCAPTCHA v2 site/secret keys

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your real values
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your Paystack public key and reCAPTCHA site key
```

### 3. Create admin account

After starting the server, register a normal account, then update it in MongoDB:
```javascript
// In MongoDB Atlas → your database → users collection
// Find your user and set: role: "admin"
```

Or run this one-time script:
```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  await User.findOneAndUpdate({ email: 'akotoemphraim039@gmail.com' }, { role: 'admin' });
  console.log('Admin role set!');
  process.exit();
});
"
```

### 4. Start the servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend runs at: http://localhost:5173  
Backend API at: http://localhost:5000

---

## Payment Flow

1. Customer adds items → proceeds to checkout
2. Fills shipping address + selects payment method
3. Clicks "Pay" → backend initializes Paystack transaction
4. Paystack inline popup opens (card / mobile money / bank)
5. On success → backend creates order, reduces stock, sends confirmation email
6. Customer redirected to orders page

**Supported payment channels:**
- Visa / Mastercard (credit & debit)
- MTN Mobile Money
- Vodafone Cash
- AirtelTigo Money
- Bank transfer (Access Bank Ghana)

---

## Email Notifications

All emails are sent from: `akotoemphraim039@gmail.com`

| Trigger | Recipient | Content |
|---------|-----------|---------|
| Registration | Customer | Welcome email |
| Order placed | Customer | Order confirmation with items, total, shipping address |
| Order status update | Customer | Current status + tracking link |
| Contact form | Admin | Customer enquiry details |
| Password reset | Customer | Secure reset link (1 hour expiry) |

---

## Contact Information (Store Owner)

**Name:** Ephraim Akoto Nana Yaw  
**Phone / WhatsApp:** 0592384780 / 0204069997  
**Email:** akotoemphraim039@gmail.com  
**Mobile Money (MoMo):** 0535570336  
**Bank:** Access Bank Ghana — Account: 1018000004379  

---

## Deployment

### Backend — Recommended: Railway, Render, or Heroku
- Set all environment variables in the platform dashboard
- Set `NODE_ENV=production`
- Set `FRONTEND_URL` to your actual frontend domain

### Frontend — Recommended: Vercel or Netlify
- Set `VITE_API_URL` to your backend URL (e.g. `https://api.biggodimports.com/api`)
- Set `VITE_PAYSTACK_PUBLIC_KEY` and `VITE_RECAPTCHA_SITE_KEY`

---

## Security Checklist Before Going Live

- [ ] Replace reCAPTCHA test keys with real keys
- [ ] Switch Paystack from test to live keys
- [ ] Set `NODE_ENV=production` on backend
- [ ] Use a strong, random JWT_SECRET (64+ chars)
- [ ] Set up Paystack webhook URL in Paystack dashboard
- [ ] Enable HTTPS on both frontend and backend
- [ ] Confirm MongoDB Atlas IP whitelist or use `0.0.0.0/0` for cloud

---

*Built with care for BIG-GOD IMPORTS. May your business be blessed.*
