import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { usePreOrderCart } from '../context/PreOrderCartContext';
import './Cart.css';

export default function PreOrderCartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = usePreOrderCart();
  const navigate = useNavigate();
  const items = cart?.items?.filter(i => i.product) || [];

  if (!cartCount) return (
    <div>
      <div className="page-title"><div className="container"><h1>Pre-Order Cart</h1></div></div>
      <div className="empty-state" style={{ padding: '100px 20px' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h3>Your pre-order cart is empty</h3>
        <p>Browse pre-order items and reserve yours today.</p>
        <Link to="/pre-order" className="btn btn-primary">Browse Pre-Orders</Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-title">
        <div className="container">
          <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Pre-Order Cart</span></div>
          <h1>Pre-Order Cart</h1>
        </div>
      </div>

      {/* Notice */}
      <div style={{ background: '#f3e5f5', borderBottom: '1px solid #ce93d8', padding: '10px 0' }}>
        <div className="container">
          <p style={{ fontSize: '13px', color: '#6a1b9a', fontWeight: '600' }}>
            📦 Delivery is included in the price of all pre-order items. No extra delivery fee at checkout.
          </p>
        </div>
      </div>

      <div className="container cart-layout">
        <div className="cart-items">
          <div className="cart-header"><span>Product</span><span>Price</span><span>Quantity</span><span>Total</span></div>
          {items.map(item => (
            <div key={item.product._id} className="cart-item">
              <div className="cart-item-product">
                <Link to={`/product/${item.product._id}`}>
                  {item.product.images?.[0]?.url
                    ? <img src={item.product.images[0].url} alt={item.product.name} />
                    : <div className="cart-img-placeholder" />}
                </Link>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product._id}`}><h4>{item.product.name}</h4></Link>
                  <span className="badge badge-preorder" style={{ fontSize: '10px', marginBottom: '4px', display: 'inline-block' }}>Pre-Order</span>
                  {item.product.expectedDate && (
                    <p style={{ fontSize: '12px', color: '#6a1b9a', fontWeight: '600' }}>Est: {item.product.expectedDate}</p>
                  )}
                  <button className="remove-btn" onClick={() => { removeFromCart(item.product._id); toast.success('Removed.'); }}>Remove</button>
                </div>
              </div>
              <div className="cart-item-price">GHS {item.product.price?.toFixed(2)}</div>
              <div className="cart-item-qty">
                <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-total">GHS {(item.product.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({cartCount} items)</span><span>GHS {cartTotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span style={{ color: '#6a1b9a', fontWeight: '700' }}>Included</span></div>
          <div className="summary-divider"></div>
          <div className="summary-row summary-total"><span>Total</span><span>GHS {cartTotal.toFixed(2)}</span></div>
          <button className="btn btn-gold" style={{ width: '100%', marginTop: '24px' }} onClick={() => navigate('/pre-order-checkout')}>
            Proceed to Pre-Order Checkout
          </button>
          <Link to="/pre-order" className="btn btn-outline" style={{ width: '100%', marginTop: '12px', display: 'flex' }}>
            Browse More Pre-Orders
          </Link>
        </div>
      </div>
    </div>
  );
}