import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PreOrderCartProvider } from './context/PreOrderCartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminDeliveryFees = lazy(() => import('./pages/admin/DeliveryFees'));
const PreOrder = lazy(() => import('./pages/PreOrder'));
const PreOrderCheckout = lazy(() => import('./pages/PreOrderCheckout'));
const PreOrderCartPage = lazy(() => import('./pages/PreOrderCartPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"/></div>;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="loading-page"><div className="spinner"/><p>Loading...</p></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pre-order" element={<PreOrder />} />
            <Route path="/pre-order-checkout" element={<ProtectedRoute><PreOrderCheckout /></ProtectedRoute>} />
            <Route path="/pre-order-cart" element={<ProtectedRoute><PreOrderCartPage /></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/delivery-fees" element={<AdminRoute><AdminDeliveryFees /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <PreOrderCartProvider>
            <AppLayout />
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Jost, sans-serif', fontSize: '14px', borderRadius: '4px' } }} />
          </PreOrderCartProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}